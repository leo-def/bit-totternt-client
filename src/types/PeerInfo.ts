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
    readonly id?: string,
  ) {}

  static fromPacket(response: Buffer): Array<PeerInfo> {
    if (response.length % 6 !== 0) {
      throw new Error('Invalid compact peer list length');
    }
    const peerInfo = new Array<PeerInfo>();

    for (let i = 0; i < response.length; i += 6) {
      const ip = response.subarray(i, i + 4).join('.');
      const port = response.readUInt16BE(i + 4);
      peerInfo.push(new PeerInfo(ip, port));
    }
    return peerInfo;
  }

  static fromTrackerValue(value: unknown): Array<PeerInfo> {
    if (!value) {
      return [];
    }

    if (Buffer.isBuffer(value)) {
      return PeerInfo.fromPacket(value);
    }

    if (typeof value === 'string') {
      return PeerInfo.fromPacket(PeerInfo.binaryStringToBuffer(value));
    }

    if (Array.isArray(value)) {
      return value
        .map((peer: any) => new PeerInfo(peer.ip, Number(peer.port), peer['peer id'] ?? peer.peerId ?? peer.id))
        .filter((peer: PeerInfo) => !!peer.ip && Number.isInteger(peer.port));
    }

    return [];
  }

  private static binaryStringToBuffer(value: string): Buffer {
    const buffer = Buffer.alloc(value.length);
    for (let i = 0; i < value.length; i++) {
      buffer.writeUInt8(value.charCodeAt(i) & 0xff, i);
    }
    return buffer;
  }
}
