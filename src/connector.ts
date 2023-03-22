import * as https from "https";
import * as crypto from "crypto";

export const TEST_NETWORK_PATH = "payments.testnet.zoksh.com";
export const PROD_NETWORK_PATH = "payments.zoksh.com";

export class Connector {
  zokshKey: string;
  zokshSecret: string;
  basePath: string;

  constructor(zokshKey: string, zokshSecret: string, testnet: boolean = true) {
    this.zokshKey = zokshKey;
    this.zokshSecret = zokshSecret;
    if (testnet) {
      this.basePath = TEST_NETWORK_PATH;
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

  validateSignature = (path: string, headers: any, body: any) => {
    console.log(headers);
    console.log("Request body");
    console.log(body);
  };

  redirectCount: number = 0;

  doRequest = (options: any, data: any, resolve: any, reject: any) => {
    let req;

    const handler = (res: any) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        if (this.redirectCount < 3) {
          this.redirectCount++;
          const url = new URL(res.headers.location);
          const opts = {
            ...options,
            hostname: url.hostname,
            path: url.pathname,
          };
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
