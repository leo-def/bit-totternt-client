import { BencodeUtils } from '../src/services/BencodeUtils';

export async function runInfoHashTests() {
  // build a minimal torrent-like buffer: d4:infod3:foo3:baree
  const buf = Buffer.from('d4:infod3:foo3:bareee');
  const infoRaw = BencodeUtils.extractInfoBuffer(buf);
  if (infoRaw.length === 0) throw new Error('info raw empty');
  console.log('InfoHash extraction tests passed');
}
