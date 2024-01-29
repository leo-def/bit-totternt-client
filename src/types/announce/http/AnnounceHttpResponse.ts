import { PeerInfo } from "../../PeerInfo";
import { AnnounceResponse } from "../AnnounceResponse";

export class AnnounceHttpResponse implements AnnounceResponse{


constructor(
  /**
   * interval: Interval in seconds that the client should wait between sending regular requests to the tracker
   */
  readonly interval: number,

  /**
   * complete: number of peers with the entire file, i.e. seeders (integer)
   */
  readonly seeders: number,

  /**
   * incomplete: number of non-seeder peers, aka "leechers" (integer)
   */
  readonly leechers: number,

  /**
   * peers: (dictionary model) The value is a list of dictionaries
   * peers: (binary model) Instead of using the dictionary model described above, the peers value may be a string consisting of multiples of 6 bytes. First 4 bytes are the IP address and last 2 bytes are the port number. All in network (big endian) notation.
   */
  readonly peers: Array<PeerInfo> = [],

  /**
   * failure reason: If present, then no other keys may be present. The value is a human-readable error message as to why the request failed (string).
   */
  readonly failureReason?: string,

  /**
   * warning message: (new, optional) Similar to failure reason, but the response still gets processed normally. The warning message is shown just like an error.
   */
  readonly warningMessage?: string,


  /**
   * min interval: (optional) Minimum announce interval. If present clients must not reannounce more frequently than this.
   */
  readonly minInterval?: string,

  /**
   * tracker id: A string that the client should send back on its next announcements. If absent and a previous announce sent a tracker id, do not discard the old value; keep using it.
   */
  readonly trackerId?: string,
){}

  static fromResponse(value: any) {
    return {
      failureReason: value["failure reason"],
      warningMessage: value["warning message"],
      interval: value["interval"],
      minInterval: value["min interval"],
      trackerId: value["tracker id"],
      seeders: value["complete"],
      leechers: value["incomplete"],
      peers: value["peers"],
      peerId: value["peer id"],
      ip: value["ip"],
      port: value["port"],
    } as AnnounceHttpResponse;
  }
}
