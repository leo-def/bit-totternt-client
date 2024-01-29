import path from "path";
import { BencodeUtils } from "./services/BencodeUtils";
import crypto from "crypto";
import fs from "fs";
import { PeerInfo } from "./types/PeerInfo";
import { FileMetaInfo } from "./types/bencode/file/FileMetaInfo";
import { AnnounceUdpRequest } from "./types/announce/udp/AnnounceUdpRequest";
import { TrackerClient } from "./services/trackerClient/TrackerClient";
import { AnnounceResponse } from "./types/announce/AnnounceResponse";

function getFileMetaInfo(): FileMetaInfo {
  const filePath = path.join(process.cwd(), "sample.torrent");
  const str = fs.readFileSync(filePath);
  const response = FileMetaInfo.fromFile(BencodeUtils.handle(str)?.value);
  if (!response) {
    throw new Error("Invalid File Meta Info");
  }
  return response;
}

function getPeerInfo(): PeerInfo {
  const id = crypto.randomBytes(20).toString('hex');
  return {
    ip: "125.6.7.1",
    port: 8080,
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
async function run() {
  const fileMetaInfo = getFileMetaInfo();
  const peerInfo = getPeerInfo();
  const announceResponse = await announce(peerInfo, fileMetaInfo);
  console.log({ announceResponse });
}
run().then(() => console.log("terminated"));
