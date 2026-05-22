import dgram from 'dgram';
import { RequestUtils } from '../src/services/request/RequestUtils';

export async function runRequestUtilsUdpTests() {
  const server = dgram.createSocket('udp4');
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.bind(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Invalid UDP server address');
  }

  server.on('message', (msg, rinfo) => {
    server.send(Buffer.from('pong'), 0, 4, rinfo.port, rinfo.address);
  });

  const response = await RequestUtils.udp(`udp://127.0.0.1:${address.port}`, {
    body: Buffer.from('ping'),
    timeout: 2000,
  });
  server.close();

  if (response.toString() !== 'pong') {
    throw new Error('UDP response mismatch: expected pong got ' + response.toString());
  }
  console.log('UDP request utils timeout/close tests passed');
}
