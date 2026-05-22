import crypto from 'crypto';
import net from 'net';
import { PeerInfo } from '../../types/PeerInfo';

export interface PeerWireHandshakeResult {
  peerId: string;
  infoHash: string;
  reserved: Buffer;
}

export class PeerWireClient {
  static async handshake(
    peer: PeerInfo,
    infoHashHex: string,
    peerId: string,
    timeout = 5000,
  ): Promise<PeerWireHandshakeResult> {
    const infoHashBuffer = PeerWireClient.to20ByteBuffer(infoHashHex, 'infoHash');
    const peerIdBuffer = PeerWireClient.to20ByteBuffer(peerId, 'peerId');
    const socket = new net.Socket();

    const handshakePayload = PeerWireClient.buildHandshake(infoHashBuffer, peerIdBuffer);

    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timeout | undefined;
      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
        socket.removeAllListeners();
        socket.destroy();
      };

      timer = setTimeout(() => {
        cleanup();
        reject(new Error('Peer handshake timeout'));
      }, timeout);

      socket.on('error', (err) => {
        cleanup();
        reject(err);
      });

      socket.connect(peer.port, peer.ip, () => {
        socket.write(handshakePayload);
      });

      socket.on('data', (data) => {
        cleanup();
        try {
          const result = PeerWireClient.parseHandshakeResponse(data, infoHashBuffer);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  static verifyBlockHash(block: Buffer, expectedHashHex: string): boolean {
    return crypto.createHash('sha1').update(block).digest('hex') === expectedHashHex;
  }

  private static buildHandshake(infoHash: Buffer, peerId: Buffer): Buffer {
    const protocol = 'BitTorrent protocol';
    const pstrlenBuffer = Buffer.from([protocol.length]);
    const pstrBuffer = Buffer.from(protocol, 'utf8');
    const reserved = Buffer.alloc(8, 0);
    return Buffer.concat([pstrlenBuffer, pstrBuffer, reserved, infoHash, peerId]);
  }

  private static parseHandshakeResponse(data: Buffer, expectedInfoHash: Buffer): PeerWireHandshakeResult {
    const pstrlen = data.readUInt8(0);
    const pstr = data.toString('utf8', 1, 1 + pstrlen);
    if (pstrlen !== 19 || pstr !== 'BitTorrent protocol') {
      throw new Error('Invalid peer handshake protocol string');
    }
    const reserved = data.subarray(1 + pstrlen, 1 + pstrlen + 8);
    const infoHash = data.subarray(1 + pstrlen + 8, 1 + pstrlen + 8 + 20);
    if (!infoHash.equals(expectedInfoHash)) {
      throw new Error('Peer handshake info_hash mismatch');
    }
    const peerId = data.subarray(1 + pstrlen + 8 + 20, 1 + pstrlen + 8 + 20 + 20);
    return {
      peerId: peerId.toString('hex'),
      infoHash: infoHash.toString('hex'),
      reserved,
    };
  }

  private static buildRequest(index: number, begin: number, length: number): Buffer {
    const buffer = Buffer.alloc(17);
    buffer.writeUInt32BE(13, 0);
    buffer.writeUInt8(6, 4); // request message id
    buffer.writeUInt32BE(index, 5);
    buffer.writeUInt32BE(begin, 9);
    buffer.writeUInt32BE(length, 13);
    return buffer;
  }

  private static parsePieceMessage(data: Buffer): { index: number; begin: number; block: Buffer } {
    const lengthPrefix = data.readUInt32BE(0);
    const messageId = data.readUInt8(4);
    if (messageId !== 7) {
      throw new Error(`Unexpected message id ${messageId}, expected piece`);
    }
    const index = data.readUInt32BE(5);
    const begin = data.readUInt32BE(9);
    const block = data.subarray(13, 4 + lengthPrefix);
    return { index, begin, block };
  }

  static async downloadPiece(
    peer: PeerInfo,
    infoHashHex: string,
    peerId: string,
    index: number,
    begin: number,
    length: number,
    timeout = 5000,
  ): Promise<Buffer> {
    const infoHashBuffer = PeerWireClient.to20ByteBuffer(infoHashHex, 'infoHash');
    const peerIdBuffer = PeerWireClient.to20ByteBuffer(peerId, 'peerId');
    const socket = new net.Socket();
    const handshakePayload = PeerWireClient.buildHandshake(infoHashBuffer, peerIdBuffer);
    const requestPayload = PeerWireClient.buildRequest(index, begin, length);

    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timeout | undefined;
      let state: 'handshake' | 'waitingPiece' = 'handshake';
      let buffered = Buffer.alloc(0);

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
        socket.removeAllListeners();
        socket.destroy();
      };

      const tryParseHandshake = () => {
        if (buffered.length < 68) {
          return false;
        }
        const handshakeResponse = buffered.subarray(0, 68);
        PeerWireClient.parseHandshakeResponse(handshakeResponse, infoHashBuffer);
        buffered = buffered.subarray(68);
        socket.write(requestPayload);
        state = 'waitingPiece';
        return true;
      };

      const tryParsePiece = () => {
        if (buffered.length < 4) {
          return false;
        }
        const messageLength = buffered.readUInt32BE(0);
        if (buffered.length < 4 + messageLength) {
          return false;
        }
        const pieceMessage = buffered.subarray(0, 4 + messageLength);
        const parsed = PeerWireClient.parsePieceMessage(pieceMessage);
        cleanup();
        resolve(parsed.block);
        return true;
      };

      timer = setTimeout(() => {
        cleanup();
        reject(new Error('Peer download timeout'));
      }, timeout);

      socket.on('error', (err) => {
        cleanup();
        reject(err);
      });

      socket.on('data', (data) => {
        buffered = Buffer.concat([buffered, data]);
        if (state === 'handshake') {
          if (!tryParseHandshake()) {
            return;
          }
        }
        if (state === 'waitingPiece') {
          if (tryParsePiece()) {
            return;
          }
        }
      });

      socket.connect(peer.port, peer.ip, () => {
        socket.write(handshakePayload);
      });
    });
  }

  private static to20ByteBuffer(value: string, name: string): Buffer {
    if (value.length === 40 && /^[0-9a-fA-F]+$/.test(value)) {
      const buffer = Buffer.from(value, 'hex');
      if (buffer.length !== 20) {
        throw new Error(`Invalid ${name}: expected 20 bytes`);
      }
      return buffer;
    }
    const buffer = Buffer.from(value, 'utf8');
    if (buffer.length !== 20) {
      throw new Error(`Invalid ${name}: expected 20 bytes`);
    }
    return buffer;
  }
}
