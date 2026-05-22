import { AnnounceHttpResponse } from "../src/types/announce/http/AnnounceHttpResponse";
import { PeerInfo } from "../src/types/PeerInfo";

export async function runPeerCompactTests() {
  const compactPeers = Buffer.from([127, 0, 0, 1, 0x1a, 0xe1, 10, 0, 0, 2, 0x1a, 0xe2]);
  const parsedFromBuffer = PeerInfo.fromPacket(compactPeers);

  if (parsedFromBuffer.length !== 2) {
    throw new Error("Compact peer buffer count mismatch");
  }
  if (parsedFromBuffer[0].ip !== "127.0.0.1" || parsedFromBuffer[0].port !== 6881) {
    throw new Error("Compact peer buffer first peer mismatch");
  }

  const compactString = Array.from(compactPeers)
    .map((byte: number) => String.fromCharCode(byte))
    .join("");
  const response = AnnounceHttpResponse.fromResponse({
    interval: 1800,
    complete: 1,
    incomplete: 0,
    peers: compactString,
  });

  if (response.peers.length !== 2) {
    throw new Error("HTTP compact peer count mismatch");
  }
  if (response.peers[1].ip !== "10.0.0.2" || response.peers[1].port !== 6882) {
    throw new Error("HTTP compact peer second peer mismatch");
  }

  console.log("Compact peer parsing tests passed");
}
