import { AnnounceHttpRequest } from '../src/types/announce/http/AnnounceHttpRequest';
import { PeerInfo } from '../src/types/PeerInfo';
import { FileMetaInfo } from '../src/types/bencode/file/FileMetaInfo';
import { FileMetaInfoContent } from '../src/types/bencode/file/FileMetaInfoContent';

export async function runHttpAnnounceTests() {
  const fileMeta = new FileMetaInfo(
    'http://tracker.test/announce',
    new FileMetaInfoContent(100, 'file', 16384, '01234567890123456789')
  );
  const peerInfo: PeerInfo = { ip: '127.0.0.1', port: 6881, id: '0123456789012345678901234567890123456789' };
  const request = AnnounceHttpRequest.build(peerInfo, fileMeta);
  const query = AnnounceHttpRequest.toQueryString(request);

  if (!query.includes('info_hash=%')) {
    throw new Error('info_hash not percent-encoded in query');
  }
  if (!query.includes('peer_id=%')) {
    throw new Error('peer_id not percent-encoded in query');
  }
  console.log('HTTP announce URL-encoding tests passed');
}
