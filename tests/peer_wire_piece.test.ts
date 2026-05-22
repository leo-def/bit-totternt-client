import crypto from 'crypto';
import net from 'net';
import { PeerWireClient } from '../src/services/peerClient/PeerWireClient';
import { PeerInfo } from '../src/types/PeerInfo';

export async function runPeerWirePieceTests() {
  const serverPeerId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const clientPeerId = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const infoHash = '0123456789012345678901234567890123456789';
  const pieceIndex = 0;
  const begin = 0;
  const block = Buffer.from('hello');

  const server = net.createServer((socket) => {
    let state: 'handshake' | 'waitingRequest' = 'handshake';
    let buffer = Buffer.alloc(0);

    socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data]);
      if (state === 'handshake') {
        if (buffer.length >= 68) {
          const handshake = buffer.subarray(0, 68);
          const infoHashReceived = handshake.subarray(28, 48);
          if (infoHashReceived.toString('hex') !== infoHash) {
            socket.destroy();
          }
          buffer = buffer.subarray(68);
          const response = Buffer.concat([
            Buffer.from([19]),
            Buffer.from('BitTorrent protocol', 'utf8'),
            Buffer.alloc(8, 0),
            Buffer.from(infoHash, 'hex'),
            Buffer.from(serverPeerId, 'hex'),
          ]);
          socket.write(response);
          state = 'waitingRequest';
        }
      }
      if (state === 'waitingRequest' && buffer.length >= 17) {
        const lengthPrefix = buffer.readUInt32BE(0);
        if (buffer.length >= 4 + lengthPrefix) {
          const messageId = buffer.readUInt8(4);
          if (messageId !== 6) {
            socket.destroy();
            return;
          }
          const response = Buffer.alloc(4 + 9 + block.length);
          response.writeUInt32BE(9 + block.length, 0);
          response.writeUInt8(7, 4);
          response.writeUInt32BE(pieceIndex, 5);
          response.writeUInt32BE(begin, 9);
          block.copy(response, 13);
          socket.write(response);
          socket.end();
        }
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('invalid server address');
  }

  const peerInfo: PeerInfo = { ip: '127.0.0.1', port: address.port, id: clientPeerId };
  const received = await PeerWireClient.downloadPiece(peerInfo, infoHash, clientPeerId, pieceIndex, begin, block.length, 2000);
  server.close();

  const expectedHash = crypto.createHash('sha1').update(block).digest('hex');
  if (!received.equals(block)) {
    throw new Error('Piece block mismatch: ' + received.toString('hex'));
  }
  if (!PeerWireClient.verifyBlockHash(received, expectedHash)) {
    throw new Error('Piece SHA1 verification failed');
  }
  console.log('Peer wire piece download tests passed');
}
