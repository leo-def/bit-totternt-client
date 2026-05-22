import { AnnounceUdpRequest } from '../src/types/announce/udp/AnnounceUdpRequest';
import { TrackerUdpRequestActionEnum } from '../src/enum/TrackerUdpRequestAction.enum';
import { FileMetaInfo } from '../src/types/bencode/file/FileMetaInfo';
import { FileMetaInfoContent } from '../src/types/bencode/file/FileMetaInfoContent';

export async function runAnnounceUdpTests() {
  const request = new AnnounceUdpRequest(
    '0123456789012345678901234567890123456789',
    '0123456789012345678901234567890123456789',
    0n,
    0n,
    1n,
    '127.0.0.1',
    50,
    6881,
    0n,
    TrackerUdpRequestActionEnum.announce,
    1,
    0,
    123,
  );
  const packet = AnnounceUdpRequest.toPacket(request);
  if (packet.length !== 98) {
    throw new Error('Announce packet length expected 98 got ' + packet.length);
  }
  const port = packet.readUInt16BE(packet.length - 2);
  if (port !== 6881) {
    throw new Error('Port encoding incorrect: expected 6881 got ' + port);
  }
  console.log('Announce UDP serialization tests passed');
}
