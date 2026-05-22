import crypto from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { TorrentFileWriter } from '../src/services/TorrentFileWriter';
import { FileMetaInfo } from '../src/types/bencode/file/FileMetaInfo';
import { FileMetaInfoContent } from '../src/types/bencode/file/FileMetaInfoContent';

function hashBinaryString(piece: Buffer): string {
  return crypto.createHash('sha1').update(piece).digest('binary');
}

export async function runTorrentFileWriterTests() {
  const piece0 = Buffer.from('hello ');
  const piece1 = Buffer.from('world');
  const pieces = hashBinaryString(piece0) + hashBinaryString(piece1);
  const fileMetaInfo = new FileMetaInfo(
    'http://tracker.test/announce',
    new FileMetaInfoContent(piece0.length + piece1.length, 'sample.txt', piece0.length, pieces),
  );

  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bit-torrent-client-'));
  const result = await TorrentFileWriter.write(fileMetaInfo, [piece0, piece1], outputDir);
  const content = await fs.readFile(result.outputPaths[0]);

  if (result.bytesWritten !== piece0.length + piece1.length) {
    throw new Error('Torrent writer bytesWritten mismatch');
  }
  if (content.toString('utf8') !== 'hello world') {
    throw new Error('Torrent writer content mismatch');
  }

  let failed = false;
  try {
    await TorrentFileWriter.write(fileMetaInfo, [Buffer.from('HELLO '), piece1], outputDir);
  } catch (error) {
    failed = error instanceof Error && error.message.includes('Piece hash mismatch');
  }
  if (!failed) {
    throw new Error('Torrent writer accepted an invalid piece hash');
  }

  console.log('Torrent file writer tests passed');
}
