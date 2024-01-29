export class PeerInfo {
 
  constructor(
    /**
     * peer id: peer's self-selected ID, as described above for the tracker request (string)
     * UDP:
     * Offset      Size            Name            Value
     * 20 + 6 * n  32-bit integer  IP address
     */
    readonly ip: string,
  
    /**
     * port: peer's port number (integer)
     * UDP:
     * Offset      Size            Name            Value
     * 24 + 6 * n  16-bit integer  TCP port
     * 20 + 6 * N
     */
    readonly port: number,
    readonly id?: string
  ){}
  
    static fromPacket(response: Buffer): Array<PeerInfo> {
      const peerInfo = new Array<PeerInfo>();
  
      for (let i = 0; i < response.length; i += 6) {
        const ip = response.subarray(i, i + 4).join('.');
        const port = response.readUInt16BE(i + 4);
        peerInfo.push(new PeerInfo(ip, port));
      }
      return peerInfo;
    }
  
  } 