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
      headers: { "moo-key": mooKey, "moo-ts": mooTs, "moo-sign": mooSign },
    } = req;

    if (!mooKey || !mooTs || !mooSign) {
      throw new Error(ErrorCode.INVALID_REQUEST_HEADERS);
    }
    const body = req.body;
    return { mooKey, mooTs, mooSign, body };
  }

  test(req: RequestType) {
    const { mooSign, mooTs, body } = this._parse(req);
    const { signature } = this.connector.calculateSignature(
      this.endpoint.pathname,
      body,
      mooTs
    );
    if (signature != mooSign) {
      throw new Error(ErrorCode.INVALID_SIGNATURE);
    }
    return true;
  }

  express = (req: any, res: any, next: any) => {
    try {
      this.test(req);
    } catch (e) {
      next?.(e);
    }
  };
}
