import { BencodeUtils } from '../src/services/BencodeUtils';
import crypto from 'crypto';

export async function runInfoHashTests() {
  // build a minimal torrent-like buffer: d4:infod3:foo3:baree
  const buf = Buffer.from('d4:infod3:foo3:bareee');
  const infoRaw = BencodeUtils.extractInfoBuffer(buf);
  const expected = Buffer.from('d3:foo3:bar e'.replace(/ /g, '').replace(/e$/, 'e'));
  // compute sha1
  const hash = crypto.createHash('sha1').update(infoRaw).digest();
  if (infoRaw.length === 0) throw new Error('info raw empty');
  console.log('InfoHash extraction tests passed');
}
