import { PeerInfo } from "../PeerInfo"

export interface AnnounceResponse {
    readonly interval: number
    readonly leechers: number
    readonly seeders: number
    readonly peers: Array<PeerInfo>
}