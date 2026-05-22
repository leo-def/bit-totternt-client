import net from 'net';
import { PeerWireClient } from '../src/services/peerClient/PeerWireClient';
import { PeerInfo } from '../src/types/PeerInfo';

export async function runPeerWireTests() {
  const serverPeerId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const clientPeerId = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const infoHash = '0123456789012345678901234567890123456789';

  const server = net.createServer((socket) => {
    socket.once('data', (data) => {
      const pstrlen = data.readUInt8(0);
      const infoHashResponse = data.subarray(1 + pstrlen + 8, 1 + pstrlen + 8 + 20);
      const response = Buffer.concat([
        Buffer.from([19]),
        Buffer.from('BitTorrent protocol', 'utf8'),
        Buffer.alloc(8, 0),
        infoHashResponse,
        Buffer.from(serverPeerId, 'hex'),
      ]);
      socket.write(response);
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

  const peerInfo: PeerInfo = {
    ip: '127.0.0.1',
    port: address.port,
    id: clientPeerId,
  };

  const result = await PeerWireClient.handshake(peerInfo, infoHash, clientPeerId, 2000);
  server.close();

  if (result.infoHash !== infoHash) {
    throw new Error(`Expected infoHash ${infoHash}, got ${result.infoHash}`);
  }
  if (result.peerId !== serverPeerId) {
    throw new Error(`Expected peerId ${serverPeerId}, got ${result.peerId}`);
  }
  console.log('Peer wire handshake tests passed');
}
