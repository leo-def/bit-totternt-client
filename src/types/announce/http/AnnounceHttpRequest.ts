import { AnnounceHttpRequestEventEnum } from "../../../enum/AnnounceHttRequestEvent.enum";
import { PeerInfo } from "../../PeerInfo";
import { FileMetaInfo } from "../../bencode/file/FileMetaInfo";
import { AnnounceRequest } from "../AnnounceRequest";

export class AnnounceHttpRequest implements AnnounceRequest {

  constructor(
  /**
   * The 20 byte sha1 hash of the bencoded form of the info value from the metainfo file. Note that this is a substring of the metainfo file. Don't forget to URL-encode this.
   */
  readonly infoHash: string,

  /**
   * A string of length 20 which this downloader uses as its id. Each downloader generates its own id at random at the start of a new download. Don't forget to URL-encode this.
   */
  readonly peerId: string,

  /**
   * Total amount downloaded so far, represented in base ten in ASCII.
   */
  readonly downloaded: bigint,

  /**
   * Number of bytes this client still has to download, represented in base ten in ASCII. Note that this can't be computed from downloaded and the file length since the client might be resuming an earlier download, and there's a chance that some of the downloaded data failed an integrity check and had to be re-downloaded.
   */
  readonly left: bigint,

  /**
   * Total amount uploaded so far, represented in base ten in ASCII.
   */
  readonly uploaded: bigint,

  /**
   * An optional parameter giving the IP (or dns name) which this peer is at. Generally used for the origin if it's on the same machine as the tracker; otherwise it's not normally needed.
   */
  readonly ip: string,

  /**
   * Optional key tells the tracker how many addresses the client wants in the tracker's response. The tracker does not have to supply that many. Default is 50.
   */
  readonly numwant: number,

  /**
   * Port number this peer is listening on. Common behavior is for a downloader to try to listen on port 6881 and if that port is taken try 6882, then 6883, etc. and give up after 6889.
   */
  readonly port: number,


  /**
   * Optional key which maps to started, completed, or stopped (or empty, which is the same as not being present). If not present, this is one of the announcements done at regular intervals. An announcement using started is sent when a download first begins, and one using completed is sent when the download is complete. No completed is sent if the file was complete when started. Downloaders should send an announcement using 'stopped' when they cease downloading, if they can.
   */
  readonly event: AnnounceHttpRequestEventEnum = AnnounceHttpRequestEventEnum.STARTED,

  /**
   * Extensions
   * Ask the tracker to 'not send the peer id information.
   */
  readonly noPeerId: boolean = false,

  /**
   * Extensions
   * Indicate that the tracker can send the IP address list in a compact form (see below for a detailed description)
   */
  readonly compact: number = 1,
  ){}

  static build(info: PeerInfo, file: FileMetaInfo): AnnounceHttpRequest {
    const infoHash = file.info?.pieces
    const peerId = info.id
    const ip = info.ip
    const port = info.port
    const uploaded =  0n
    const downloaded =  0n
    const left = BigInt(file.info?.length ?? 0) 
    const numwant = 50
    if(!infoHash){
      throw new Error('Info hash not valid')
    }
    if(!peerId){
      throw new Error('Peer id not valid')
    }
    return new AnnounceHttpRequest(
      infoHash,
      peerId,
      downloaded,
      left,
      uploaded,
      ip,
      numwant,
      port,
    );
  }

  static fromParamsObject(value: any): AnnounceHttpRequest {
    const infoHash = value["info_hash"]
    const peerId = value["peer_id"]
    const ip = value["ip"]
    const port = value["port"]
    const uploaded = value["uploaded"]
    const downloaded = value["downloaded"]
    const left = value["left"]
    const event = value["event"]
    const numwant = value["numwant"]
    const noPeerId = false
    const compact = value["compact"]
    return new AnnounceHttpRequest(
      infoHash,
      peerId,
      downloaded,
      left,
      uploaded,
      ip,
      numwant,
      port,
      event,
      noPeerId,
      compact
    );
  }

  static toParamsObject(object: AnnounceHttpRequest) {
    return {
       info_hash: object.infoHash,
       peer_id: object.peerId,
       ip: object.ip,
       port: object.port,
       uploaded: object.uploaded,
       downloaded: object.downloaded,
       left: object.left,
       event: object.event,
       numwant: object.numwant,
       no_peer_id: object.noPeerId,
       compact: object.compact,
    };
  }
}
