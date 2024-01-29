import { CommunicationProtocolEnum } from "../../enum/CommunicationProtocol.enum"
import { AnnounceRequest } from "../../types/announce/AnnounceRequest"
import { AnnounceResponse } from "../../types/announce/AnnounceResponse"
import { RequestUtils } from "../request/RequestUtils"
import { HttpTrackerClient } from "./HttpTrackerClient"
import { UdpTrackerClient } from "./UdpTrackerClient"

export abstract class TrackerClient {

  static getInstance(protocol: CommunicationProtocolEnum): TrackerClient {
    console.log({protocol})
    switch (protocol) {
      case CommunicationProtocolEnum.https:
      case CommunicationProtocolEnum.http:
          return HttpTrackerClient.build()
      case CommunicationProtocolEnum.udp:
          return UdpTrackerClient.build()
      default:
        throw new Error("Invalid protocol")
    }
  }

  static announce(
    announce: string,
    request: AnnounceRequest
    ): Promise<AnnounceResponse> {
      return TrackerClient.getInstance(
        RequestUtils.getCommunicationProtocol(announce)
      ).announce(
          announce,
          request)
  }
  
  abstract announce(
    announce: string,
    request: AnnounceRequest
    ): Promise<AnnounceResponse>
}
