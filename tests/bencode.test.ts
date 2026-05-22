import { BencodeUtils } from '../src/services/BencodeUtils';

export async function runBencodeTests() {
  // simple string
  const buf = Buffer.from('4:spam');
  const res = BencodeUtils.handle(buf);
  if (!res || res.value !== 'spam') throw new Error('Bencode string parse failed');

  // simple list
  const listBuf = Buffer.from('l4:spam4:eggse');
  const res2 = BencodeUtils.handle(listBuf);
  if (!res2 || !Array.isArray(res2.value) || res2.value[0] !== 'spam') throw new Error('Bencode list parse failed');

  console.log('Bencode tests passed');
}
