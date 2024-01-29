import { TrackerUdpRequestActionEnum } from "../../../enum/TrackerUdpRequestAction.enum";
import { AnnounceUdpRequest } from "./AnnounceUdpRequest";
import { PeerInfo } from "../../PeerInfo";
import { AnnounceResponse } from "../AnnounceResponse";

export class AnnounceUdpResponse implements AnnounceResponse {
  constructor(
    /**
     * Offset      Size            Name            Value
     * 8           32-bit integer  interval
     */
    readonly interval: number,
    /**
     * Offset      Size            Name            Value
     * 12          32-bit integer  leechers
     */
    readonly leechers: number,
    /**
     * Offset      Size            Name            Value
     * 16          32-bit integer  seeders
     */
    readonly seeders: number,

    /**
     * Offset      Size            Name            Value
     * 20 + 6 * n  32-bit integer  IP address
     * Offset      Size            Name            Value
     * 24 + 6 * n  16-bit integer  TCP port
     * 20 + 6 * N
     */
    readonly peers: Array<PeerInfo> = [],

    /**
     * Offset      Size            Name            Value
     * 0           32-bit integer  action          1 // announce
     */
    readonly action: TrackerUdpRequestActionEnum = TrackerUdpRequestActionEnum.announce,
    /**
     * Offset      Size            Name            Value
     * 4           32-bit integer  transaction_id
     */
    readonly transactionId: number = 0
  ) {}

  static validate(
    request: AnnounceUdpRequest,
    response: AnnounceUdpResponse
  ): boolean {
    return (
      request.action === response.action &&
      request.action === TrackerUdpRequestActionEnum.announce &&
      request.transactionId === response.transactionId
    );
  }

  static fromPacket(response: Buffer): AnnounceUdpResponse {
    const action = response.readUInt32BE(0);
    const transactionId = response.readUInt32BE(4);
    const interval = response.readUInt32BE(8); // Interval in seconds
    const leechers = response.readUInt32BE(12); // Number of leechers
    const seeders = response.readUInt32BE(16); // Number of seeders
    const peers = PeerInfo.fromPacket(response.subarray(20));

    return new AnnounceUdpResponse(
        interval,
        leechers,
        seeders,
        peers,
        action,
        transactionId,
    );
  }
}
