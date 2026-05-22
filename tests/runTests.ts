import { runBencodeTests } from './bencode.test';
import { runConnectTests } from './connect_udp.test';
import { runInfoHashTests } from './infohash.test';
import { runAnnounceUdpTests } from './announce_udp.test';
import { runHttpAnnounceTests } from './http_announce.test';
import { runRequestUtilsUdpTests } from './request_utils_udp.test';
import { runPeerWireTests } from './peer_wire.test';
import { runPeerWirePieceTests } from './peer_wire_piece.test';
import { runPeerCompactTests } from './peer_compact.test';
import { runTorrentFileWriterTests } from './torrent_file_writer.test';

async function run() {
  try {
    await runBencodeTests();
    await runConnectTests();
    await runInfoHashTests();
    await runAnnounceUdpTests();
    await runHttpAnnounceTests();
    await runRequestUtilsUdpTests();
    await runPeerWireTests();
    await runPeerWirePieceTests();
    await runPeerCompactTests();
    await runTorrentFileWriterTests();
    console.log('\nAll tests passed');
    process.exit(0);
  } catch (e) {
    console.error('\nTest failure:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

run();
