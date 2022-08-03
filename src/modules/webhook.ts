import { Connector } from "../connector";
import { ApiResource } from "./ApiResource";

export const ErrorCode = {
  INVALID_REQUEST: "invalid-request",
  MISSING_REQUEST_HEADERS: "missing-request-headers",
  INVALID_REQUEST_HEADERS: "invalid-request-headers",
  MISSING_REQUEST_BODY: "missing-request-body",
  INVALID_SIGNATURE: "invalid-signature",
};

type RequestType = {
  headers: any;
  body: any;
};

export class Webhook extends ApiResource {
  endpoint: URL;
  constructor(connector: Connector, webhookEndPoint: URL) {
    super(connector);
    this.endpoint = webhookEndPoint;
  }

  _parse(req: RequestType) {
    if (!req) {
      throw new Error(ErrorCode.INVALID_REQUEST);
    }
    if (!req.headers) {
      throw new Error(ErrorCode.MISSING_REQUEST_HEADERS);
    }
    if (!req.body) {
      throw new Error(ErrorCode.MISSING_REQUEST_BODY);
    }
    const {
      headers: {
        "zoksh-key": zokshKey,
        "zoksh-ts": zokshTs,
        "zoksh-sign": zokshSign,
      },
    } = req;

    if (!zokshKey || !zokshTs || !zokshSign) {
      throw new Error(ErrorCode.INVALID_REQUEST_HEADERS);
    }
    const body = req.body;
    return { zokshKey, zokshTs, zokshSign, body };
  }

  test(req: RequestType) {
    const { zokshSign, zokshTs, body } = this._parse(req);
    const { signature } = this.connector.calculateSignature(
      this.endpoint.pathname,
      body,
      zokshTs
    );
    if (signature != zokshSign) {
      throw new Error(ErrorCode.INVALID_SIGNATURE);
    }
    return true;
  }

  handle(headers: any, body: any) {
    return this.test({ headers, body });
  }

  express = (req: any, res: any, next: any) => {
    try {
      this.test(req);
      next(true);
    } catch (e) {
      next?.(e);
    }
  };
}
