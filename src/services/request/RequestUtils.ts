import http from "http";
import https from "https";
import dgram from "dgram";
import { CommunicationProtocolEnum } from "../../enum/CommunicationProtocol.enum";
import { HttpRequestUtils } from "./HttpRequestUtils";

export class RequestUtils {

    static getCommunicationProtocol(href: string) {
      const [protocol] = href.split("://")
      return protocol as CommunicationProtocolEnum
    }
  
    static async  resolve(href: string, params: {commons?: any, [x: string]: any | undefined}): Promise<Buffer>  {
      const protocol = RequestUtils.getCommunicationProtocol(href)
      const protocolResolvers: {[x:string]: (href: string, params: any) => Promise<Buffer>} = {
        [CommunicationProtocolEnum.http]: RequestUtils.http,
        [CommunicationProtocolEnum.https]: RequestUtils.https,
        [CommunicationProtocolEnum.udp]: RequestUtils.udp
      }
      const protocolResolver = protocolResolvers[protocol]
      if(!protocolResolver) {
        throw new Error("No resolver for protocol "+protocol)
      }
      const requestParams = {
        ...(params.commons ?? {}),
        ...(params[protocol] ?? {})
      }
      return await protocolResolver(href, requestParams)
    }
  
    static http(href: string, params: any): Promise<Buffer> {
      return new Promise(function (resolve, reject) {
        const {method, body} = params
        HttpRequestUtils.resolveHttpRequest(
          http.request(
          {
            href: HttpRequestUtils.resolveHttpHref(href, params),
            method,
          },
          HttpRequestUtils.httpRequestCallback(resolve, reject)
        ), body);
      });
    }
  
    static https(href: string, params: any): Promise<Buffer> {
      const {method, body} = params
      return new Promise(function (resolve, reject) {
        HttpRequestUtils.resolveHttpRequest(
          https.request(
          {
            href: HttpRequestUtils.resolveHttpHref(href, params),
            method,
          },
          HttpRequestUtils.httpRequestCallback(resolve, reject)
        ), body);
      });
    }

    static udp(href: string, {body, listen}: any): Promise<Buffer> {
      //tracker.example.com:1234
      const [, url] = href.split("://");
      const [host, port] = url.split(":");
      const offset = 0;
      var client = dgram.createSocket("udp4").bind(listen?.port ?? 57838, listen?.ip ?? '0.0.0.0');
      return new Promise((resolve, reject) => {
        client.on("listening", function () {
          var address = client.address();
          console.log(
            "UDP Server listening on " + address.address + ":" + address.port
          );
        });
  
        client.on("message", function (message, remote) {
          console.log("UDP message received => " + remote.address + ":" + remote.port + " - " + message);
          resolve(message)
        });
        if (body) {
          client.send(
            body,
            offset,
            body.length,
            Number(port),
            host,
            function (err, bytes) {
              if (err) reject(err);
              console.log("UDP message " + bytes + " sent to " + host + ":" + port);
            }
          );
        }
      });
    }
  
  }