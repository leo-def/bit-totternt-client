import path from "path";
import { BencodeUtils } from "./services/BencodeUtils";
import crypto from "crypto";
import fs from "fs";
import { PeerInfo } from "./types/PeerInfo";
import { FileMetaInfo } from "./types/bencode/file/FileMetaInfo";
import { AnnounceUdpRequest } from "./types/announce/udp/AnnounceUdpRequest";
import { TrackerClient } from "./services/trackerClient/TrackerClient";
import { AnnounceResponse } from "./types/announce/AnnounceResponse";
import { PeerWireClient } from "./services/peerClient/PeerWireClient";
import { TorrentFileWriter } from "./services/TorrentFileWriter";

function printHelp() {
  console.log(`Usage: node ./build/index.js [options]\n\nOptions:\n  --help       Show this help message\n  --torrent    Path to .torrent file (defaults to ./sample.torrent)\n  --output     Directory where downloaded files will be written (defaults to ./downloads)\n\nExamples:\n  node ./build/index.js --torrent ./examples/torrent/sample.torrent --output ./downloads\n`);
}

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

function getArgValue(name: string, fallback: string): string {
  const index = argv.indexOf(name);
  if (index === -1 || !argv[index + 1]) {
    return fallback;
  }
  return argv[index + 1];
}

function getFileMetaInfo(filePath: string): FileMetaInfo {
  const str = fs.readFileSync(filePath);
  const parsed = BencodeUtils.handle(str);
  const response = FileMetaInfo.fromFile(parsed?.value);
  // compute info_hash raw sha1 from bencoded info dict
  try {
    const infoRaw = BencodeUtils.extractInfoBuffer(str);
    const infoHashHex = crypto.createHash('sha1').update(infoRaw).digest('hex');
    if (response) {
      (response as any).__infoHashHex = infoHashHex;
    }
  } catch (e) {
    // ignore if extraction failed; will be handled later if needed
  }
  if (!response) {
    throw new Error("Invalid File Meta Info");
  }
  return response;
}

function getPeerInfo(): PeerInfo {
  const id = crypto.randomBytes(20).toString("hex");
  return {
    ip: "0.0.0.0",
    port: 6881,
    id,
  } as PeerInfo;
}

async function announce(
  peerInfo: PeerInfo,
  fileMetaInfo: FileMetaInfo
): Promise<AnnounceResponse> {
  const request = AnnounceUdpRequest.build(peerInfo, fileMetaInfo);
  if (!fileMetaInfo.announce) {
    throw Error("Invalid File Meta Info");
  }
  return await TrackerClient.announce(fileMetaInfo.announce, request);
}

async function downloadPieces(
  peers: Array<PeerInfo>,
  fileMetaInfo: FileMetaInfo,
  clientPeerId: string,
): Promise<Array<Buffer>> {
  if (peers.length === 0) {
    throw new Error("Tracker did not return peers");
  }

  const infoHashHex = (fileMetaInfo as any).__infoHashHex;
  if (!infoHashHex) {
    throw new Error("Info hash not available");
  }

  const pieces = new Array<Buffer>();
  const pieceCount = TorrentFileWriter.getPieceHashes(fileMetaInfo).length;
  for (let pieceIndex = 0; pieceIndex < pieceCount; pieceIndex++) {
    const pieceLength = TorrentFileWriter.getPieceLength(fileMetaInfo, pieceIndex);
    pieces.push(await downloadPieceFromAnyPeer(peers, infoHashHex, clientPeerId, pieceIndex, pieceLength));
    console.log(`Downloaded piece ${pieceIndex + 1}/${pieceCount}`);
  }
  return pieces;
}

async function downloadPieceFromAnyPeer(
  peers: Array<PeerInfo>,
  infoHashHex: string,
  clientPeerId: string,
  pieceIndex: number,
  pieceLength: number,
): Promise<Buffer> {
  let lastError: Error | undefined;
  for (const peer of peers) {
    try {
      return await PeerWireClient.downloadPiece(peer, infoHashHex, clientPeerId, pieceIndex, 0, pieceLength, 15000);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Peer ${peer.ip}:${peer.port} failed for piece ${pieceIndex}: ${lastError.message}`);
    }
  }
  throw lastError ?? new Error(`Could not download piece ${pieceIndex}`);
}

async function run() {
  const defaultTorrent = process.env.TORRENT_PATH ?? path.join(process.cwd(), "sample.torrent");
  const defaultOutput = process.env.OUTPUT_DIR ?? path.join(process.cwd(), "downloads");

  const torrentPath = path.resolve(getArgValue("--torrent", defaultTorrent));
  const outputDir = path.resolve(getArgValue("--output", defaultOutput));
  const fileMetaInfo = getFileMetaInfo(torrentPath);
  const peerInfo = getPeerInfo();
  const announceResponse = await announce(peerInfo, fileMetaInfo);
  console.log({ announceResponse });

  if (!peerInfo.id) {
    throw new Error("Peer id not available");
  }
  const pieces = await downloadPieces(announceResponse.peers, fileMetaInfo, peerInfo.id);
  const writeResult = await TorrentFileWriter.write(fileMetaInfo, pieces, outputDir);
  console.log({ writeResult });
}
run().then(() => console.log("terminated"));
