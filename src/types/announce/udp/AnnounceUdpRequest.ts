import crypto from "crypto";
import { TrackerUdpRequestActionEnum } from "../../../enum/TrackerUdpRequestAction.enum";
import { FileMetaInfo } from "../../bencode/file/FileMetaInfo";
import { PeerInfo } from "../../PeerInfo";
import { AnnounceRequest } from "../AnnounceRequest";
import { ConnectUdpResponse } from "./ConnectUdpResponse";

export class AnnounceUdpRequest implements AnnounceRequest {
  constructor(
    /**
     * Offset  Size    Name    Value
     * 16      20-byte string  info_hash
     */
    readonly infoHash: string,

    /**
     * Offset  Size    Name    Value
     * 36      20-byte string  peer_id
     */
    readonly peerId: string,

    /**
     * Offset  Size    Name    Value
     * 56      64-bit integer  downloaded
     */
    readonly downloaded: bigint,

    /**
     * Offset  Size    Name    Value
     * 64      64-bit integer  left
     */
    readonly left: bigint,

    /**
     * Offset  Size    Name    Value
     * 72      64-bit integer  uploaded
     */
    readonly uploaded: bigint,

    /**
     * Offset  Size    Name    Value
     * 84      32-bit integer  IP address      0 // default
     */
    readonly ip: string,

    /**
     * Offset  Size    Name    Value
     * 92      32-bit integer  num_want        -1 // default
     */
    readonly numwant: number,

    /**
     * Offset  Size    Name    Value
     * 96      16-bit integer  port
     * 98
     */
    readonly port: number,

    /**
     * Offset  Size    Name    Value
     * 0       64-bit integer  connection_id  // from connect
     */
    public connectionId?: bigint,

    /**
     * Offset  Size    Name    Value
     * 8       32-bit integer  action          1 // announce
     */
    readonly action: TrackerUdpRequestActionEnum = TrackerUdpRequestActionEnum.announce,

    /**
     * Offset  Size    Name    Value
     * 12      32-bit integer  transaction_id
     */
    readonly transactionId?: number,

    /**
     * Offset  Size    Name    Value
     * 80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
     */
    readonly event?: number,

    /**
     * Offset  Size    Name    Value
     * 88      32-bit integer  key
     */
    readonly key?: number
  ) {}

  static build(info: PeerInfo, file: FileMetaInfo): AnnounceUdpRequest {
    const action = TrackerUdpRequestActionEnum.announce;
    const transactionId = crypto.randomBytes(4).readInt32BE();
    const infoHash = file.info?.pieces;
    const peerId = info.id;
    const downloaded = 0n;
    const left = 0n;
    const uploaded = 1n;
    const event = 0;
    const ip = info.ip;
    const key = crypto.randomBytes(4).readInt32BE();
    const numwant = 50;
    const port = info.port;
    const connectionId = undefined;
    if(!infoHash){
      throw new Error('Info hash not valid')
    }
    if(!peerId){
      throw new Error('Peer id not valid')
    }
    return new AnnounceUdpRequest(
      infoHash,
      peerId,
      downloaded,
      left,
      uploaded,
      ip,
      numwant,
      port,
      connectionId,
      action,
      transactionId,
      event,
      key,
    );
  }

  static updateWithConnectResponse(
    request: AnnounceUdpRequest,
    response: ConnectUdpResponse
  ): AnnounceUdpRequest {
    request.connectionId = response.connectionId
    return request
  }

  static toPacket(request: AnnounceUdpRequest): Buffer {
    if (!request.connectionId) {
      throw new Error("Invalid connection id");
    }
    const connectionIdBuffer = Buffer.alloc(8);
    connectionIdBuffer.writeBigInt64BE(request.connectionId, 0);

    const actionBuffer = Buffer.alloc(4);
    actionBuffer.writeInt32BE(request.action, 0);

    if (!request.transactionId) {
      throw new Error("Invalid transaction id");
    }
    const transactionIdBuffer = Buffer.alloc(4);
    transactionIdBuffer.writeInt32BE(request.transactionId, 0);

    const infoHashBuffer = Buffer.from(request.infoHash, "hex");

    const peerIdBuffer = Buffer.from(request.peerId, "hex");

    const downloadedBuffer = Buffer.alloc(8);
    downloadedBuffer.writeBigInt64BE(request.downloaded, 0);

    const leftBuffer = Buffer.alloc(8);
    leftBuffer.writeBigInt64BE(request.left, 0);

    const uploadedBuffer = Buffer.alloc(8);
    uploadedBuffer.writeBigInt64BE(request.uploaded, 0);

    if (!request.event) {
      throw new Error("Invalid event");
    }
    const eventBuffer = Buffer.alloc(4);
    eventBuffer.writeInt32BE(request.event, 0);

    const ipBuffer = Buffer.from(
      request.ip.split(".").map((part) => parseInt(part, 10))
    );

    if (!request.key) {
      throw new Error("Invalid key");
    }
    const keyBuffer = Buffer.alloc(4);
    keyBuffer.writeInt32BE(request.key, 0);

    const numwantBuffer = Buffer.alloc(4);
    numwantBuffer.writeInt32BE(request.numwant, 0);

    const portBuffer = Buffer.alloc(4);
    portBuffer.writeInt32BE(request.port, 0);

    return Buffer.concat([
      connectionIdBuffer,
      actionBuffer,
      transactionIdBuffer,
      infoHashBuffer,
      peerIdBuffer,
      downloadedBuffer,
      leftBuffer,
      uploadedBuffer,
      eventBuffer,
      ipBuffer,
      keyBuffer,
      numwantBuffer,
      portBuffer,
    ]);
  }
}
