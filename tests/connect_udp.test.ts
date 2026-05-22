import { ConnectUdpRequest } from '../src/types/announce/udp/ConnectUdpRequest';

export async function runConnectTests() {
  const packet = ConnectUdpRequest.toPacket();
  if (packet.length !== 16) throw new Error('Connect packet length expected 16 got ' + packet.length);
  console.log('Connect UDP tests passed');
}
