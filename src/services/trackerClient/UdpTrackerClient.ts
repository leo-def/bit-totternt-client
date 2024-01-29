import { AnnounceUdpRequest } from "../../types/announce/udp/AnnounceUdpRequest";
import { AnnounceUdpResponse } from "../../types/announce/udp/AnnounceUdpResponse";
import { ConnectUdpRequest } from "../../types/announce/udp/ConnectUdpRequest";
import { ConnectUdpResponse } from "../../types/announce/udp/ConnectUdpResponse";
import { RequestUtils } from "../request/RequestUtils";
import { TrackerClient } from "./TrackerClient";

export class UdpTrackerClient implements TrackerClient {

    static build(): UdpTrackerClient {
      return new UdpTrackerClient()
    }
  
    async announce(
      announce: string,
      request: AnnounceUdpRequest
      ): Promise<AnnounceUdpResponse> {
        console.log('UdpTrackerClient.announce')
        const connectResponse = await this.sendConnectAction(announce)
        return await this.sendAnnounceAction(announce, request, connectResponse)
    }


                  
    private  async sendConnectAction(announce: string): Promise<ConnectUdpResponse> {
      const packet = ConnectUdpRequest.toPacket()
      console.log(`Connect UDP Request Packet: ${packet.toString('hex')}`)
      const responsePacket = await RequestUtils.udp(announce, {body: packet})
      console.log(`Connect UDP Response Packet: ${responsePacket.toString('hex')}`)
      const response = ConnectUdpResponse.fromPacket(responsePacket);
      console.log(`Announce UDP Response Obj: ${JSON.stringify(response)}`)
      return response
    }

    private  async sendAnnounceAction(
      announce: string,
      request: AnnounceUdpRequest,
      connectResponse: ConnectUdpResponse
      ): Promise<AnnounceUdpResponse> {
      request = AnnounceUdpRequest.updateWithConnectResponse(request, connectResponse)
      console.log(`Announce UDP Request Body: ${JSON.stringify(request)}`)
      const packet = AnnounceUdpRequest.toPacket(request)
      console.log(`Announce UDP Request Packet: ${packet.toString('hex')}`)
      const responsePacket = await RequestUtils.udp(announce, {body: packet})
      console.log(`Announce UDP Response Packet: ${responsePacket.toString('hex')}`)
      const response = AnnounceUdpResponse.fromPacket(responsePacket);
      console.log(`Announce UDP Response Obj: ${JSON.stringify(response)}`)
      return response
    }
  }
  