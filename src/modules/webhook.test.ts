const nock = require("nock");

import { expect } from "chai";
import { Connector } from "../connector";
import { ErrorCode, Webhook } from "./webhook";

const mockRequest = {
  body: { hello: "world" },
  headers: {},
} as unknown as Request;

const TEST_KEY = "testKey";
const TEST_SECRET = "testSecret";

describe("Webhook Module", () => {
  describe("Webhook Validation", () => {
    let webhook: Webhook;
    let connector: Connector;
    let webhookEP: URL;

    before(() => {
      webhookEP = new URL("http://test.zoksh.com/webhook");
      connector = new Connector(TEST_KEY, TEST_SECRET, true);
      webhook = new Webhook(connector, webhookEP);
    });

    it("Should fail, no headers", async () => {
      expect(webhook.test.bind(webhook, mockRequest)).to.throw(
        ErrorCode.INVALID_REQUEST_HEADERS
      );
    });

    it("Should fail, stamp missing", async () => {
      const mR = { ...mockRequest, headers: { "zoksh-sign": "helloworld" } };
      expect(webhook.test.bind(webhook, mR)).to.throw(
        ErrorCode.INVALID_REQUEST_HEADERS
      );
    });

    it("Should pass, valid signature", () => {
      const stamp = new Date().getTime();
      const bd = { hello: "world" };
      const { signature } = connector.calculateSignature(
        webhookEP.pathname,
        bd,
        stamp
      );
      const mR = {
        body: bd,
        headers: {
          "zoksh-sign": signature,
          "zoksh-ts": stamp,
          "zoksh-key": TEST_KEY,
        },
      };
      const rs = webhook.test(mR);
      expect(rs).to.equal(true);
    });
  });
});
