import * as https from "https";
import * as crypto from "crypto";

const TEST_NETWORK_PATH = "payments.testnet.moopay.live";
const PROD_NETWORK_PATH = "payments.moopay.live";

export class Connector {
  mooKey: string;
  mooSecret: string;
  basePath: string;

  constructor(mooKey: string, mooSecret: string, testnet: boolean = true) {
    this.mooKey = mooKey;
    this.mooSecret = mooSecret;
    if (testnet) {
      this.basePath = TEST_NETWORK_PATH;
    } else {
      this.basePath = PROD_NETWORK_PATH;
    }
  }

  calculateSignature = (path: string, body: any) => {
    const postBody = JSON.stringify(body);
    const ts = new Date().getTime();
    const hmac = crypto.createHmac("sha256", this.mooSecret);

    const toSign = `${ts}${path}${postBody}`;
    const signature = hmac.update(toSign).digest("hex");
    return { ts, signature };
  };

  signAndSend = (path: string, body: any) => {
    const { ts, signature } = this.calculateSignature(path, body);
    let data = new TextEncoder().encode(JSON.stringify(body));
    let options = {
      method: "POST",
      hostname: this.basePath,
      path,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "MOO-KEY": this.mooKey,
        "MOO-TS": ts,
        "MOO-SIGN": signature,
      },
    };

    return new Promise((resolve, reject) => {
      let req;

      const handler = (res) => {
        res.setEncoding("utf-8");
        res.on("data", (d) => {
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
    });
  };
}
