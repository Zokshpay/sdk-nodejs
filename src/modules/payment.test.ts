const nock = require("nock");

import { expect } from "chai";
import { Connector, TEST_NETWORK_PATH } from "../connector";
import { ErrorCode, Payment, PATH_VALIDATE } from "./payment";

describe("Payment Module", () => {
  describe("Payment Validation", () => {
    let payment: Payment;
    before(() => {
      nock(`https://${TEST_NETWORK_PATH}`)
        .post(PATH_VALIDATE)
        .reply(200, { success: true, data: {} });
      const connector = new Connector("testKey", "testSecret", true);
      payment = new Payment(connector);
    });

    it("Should make a valid request", async () => {
      const resp: any = await payment.validate("abc");
      expect(resp.success).to.equal(true);
    });

    it("Should throw error >> invalid error", async () => {
      expect(payment.validate.bind(payment, "")).to.throw(
        ErrorCode.TRANSACTION_MISSING
      );
    });
  });
});
