import { AnnounceHttpRequest } from "../../types/announce/http/AnnounceHttpRequest";
import { AnnounceHttpResponse } from "../../types/announce/http/AnnounceHttpResponse";
import { BencodeUtils } from "../BencodeUtils";
import { RequestUtils } from "../request/RequestUtils";
import { TrackerClient } from "./TrackerClient";

export class HttpTrackerClient implements TrackerClient {
  static build(): HttpTrackerClient {
    return new HttpTrackerClient();
  }

  async announce(
    announce: string,
    request: AnnounceHttpRequest
  ): Promise<AnnounceHttpResponse> {
    console.log(`Announce HTTP Request Body: ${JSON.stringify(request)}`);
    const query = AnnounceHttpRequest.toQueryString(request);
    console.log(`Announce HTTP Request Query: ${query}`);
    const responseBuff = await RequestUtils.resolve(announce, {
      http: { query },
      https: { query },
    });
    console.log(`Announce HTTP Response Buff: ${responseBuff.toString('hex')}`);
    const response = AnnounceHttpResponse.fromResponse(
      BencodeUtils.handle(responseBuff)
    );
    console.log(`Announce HTTP Response Body: ${JSON.stringify(response)}`);
    return response;
  }
}
