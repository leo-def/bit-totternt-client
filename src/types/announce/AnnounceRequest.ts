export interface AnnounceRequest {
  readonly infoHash: string
  readonly peerId: string
  readonly downloaded: bigint
  readonly left: bigint
  readonly uploaded: bigint
  readonly ip: string
  readonly numwant: number
  readonly port: number

}