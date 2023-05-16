import * as https from "https";
import * as crypto from "crypto";

export const SANDBOX_NETWORK_PATH = "payments.sandbox.zoksh.com";
export const PROD_NETWORK_PATH = "payments.zoksh.com";

export class Connector {
  zokshKey: string;
  zokshSecret: string;
  basePath: string;

  constructor(zokshKey: string, zokshSecret: string, sandbox: boolean = true) {
    this.zokshKey = zokshKey;
    this.zokshSecret = zokshSecret;
    if (sandbox) {
      this.basePath = SANDBOX_NETWORK_PATH;
    } else {
      this.basePath = PROD_NETWORK_PATH;
    }
  }

  calculateSignature = (path: string, body: any, useTime: number = -1) => {
    const postBody = JSON.stringify(body);
    const ts = useTime != -1 ? useTime : new Date().getTime();
    const hmac = crypto.createHmac("sha256", this.zokshSecret);

    const toSign = `${ts}${path}${postBody}`;
    const signature = hmac.update(toSign).digest("hex");
    return { ts, signature };
  };

  redirectCount: number = 0;

  doRequest = (options: any, data: any, resolve: any, reject: any) => {
    let req;

    const handler = (res: any) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        if (this.redirectCount < 3) {
          this.redirectCount++;
          const loc = res.headers.location;
          let opts;
          if (loc.match(/^http/)) {
            const url = new URL(loc);
            opts = {
              ...options,
              hostname: url.hostname,
              path: url.pathname,
            };
          } else {
            opts = {
              ...options,
              path: loc,
            };
          }
          this.doRequest(opts, data, resolve, reject);
          return;
        } else {
          throw new Error("Server redirected too many times");
        }
      }
      res.setEncoding("utf-8");
      res.on("data", (d: any) => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          reject(e);
        }
      });
    };

    req = https.request(options, handler);

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  };

  signAndSend = (path: string, body: any, stamp: number = -1) => {
    const { ts, signature } = this.calculateSignature(path, body, stamp);
    let data = new TextEncoder().encode(JSON.stringify(body));
    let options = {
      method: "POST",
      hostname: this.basePath,
      path,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "ZOKSH-KEY": this.zokshKey,
        "ZOKSH-TS": ts,
        "ZOKSH-SIGN": signature,
      },
    };

    return new Promise((resolve, reject) =>
      this.doRequest(options, data, resolve, reject)
    );
  };
}
