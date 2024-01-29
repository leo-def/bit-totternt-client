import querystring from "querystring";
import http from "http";

export class HttpRequestUtils {
    
    static resolveHttpHref(href: string, {query}: any): string{
      query =  query ? typeof query === "string" ? query : querystring.stringify(query) : undefined
      return `${href}${query ? "?"+ query : ""}`
    }
  
    static resolveHttpRequest(req: http.ClientRequest, body?: any) {
      if (body) {
        req.write(body);
      }
      req.end();
    }
  
    static httpRequestCallback(resolve: (value: Buffer) => void, reject: (reason?: any) => void): (res: http.IncomingMessage) => void {
      return  function (res: http.IncomingMessage) {
        if (!res) {
          return reject(undefined);
        }
        if (
          res.statusCode &&
          (res.statusCode < 200 || res.statusCode >= 300)
        ) {
          return reject(new Error("statusCode=" + res.statusCode));
        }
        let body: any[] = [];
        res.on("data", function (chunk) {
          body.push(chunk);
        });
        res.on("end", function () {
          try {
            resolve(Buffer.concat(body));
          } catch (e) {
            reject(e);
          }
        });
      }
    }
    }