const nock = require("nock");

import { expect } from "chai";
import { Connector, TEST_NETWORK_PATH } from "../connector";
import { ErrorCode, Order, OrderType, PATH_CREATE } from "./order";

describe("Order Module", () => {
  describe("Order Create", () => {
    let order: Order;
    before(() => {
      nock(`https://${TEST_NETWORK_PATH}`)
        .post(PATH_CREATE)
        .reply(200, { orderId: 1, createdAt: 1 });
      const connector = new Connector("testKey", "testSecret", true);
      order = new Order(connector);
    });

    it("Should create a valid order", async () => {
      const resp: any = await order.create({
        amount: "20",
        merchant: { orderId: "abc" },
      });
      expect(resp.orderId).to.equal(1);
    });

    it("Should throw error >> invalid amount", async () => {
      const orderOpts: OrderType = {
        amount: "-20",
        merchant: { orderId: "abc" },
      };
      expect(order.create.bind(order, orderOpts)).to.throw(
        ErrorCode.INVALID_AMOUNT
      );
    });

    it("Should throw error >> amount missing", () => {
      const orderOpts: any = {
        merchant: { orderId: "abc" },
      };
      expect(order.create.bind(order, orderOpts)).to.throw(
        ErrorCode.INVALID_AMOUNT
      );
    });

    it("Should throw error >> merchant info missing", () => {
      const orderOpts: any = {
        amount: "20",
      };
      expect(order.create.bind(order, orderOpts)).to.throw(
        ErrorCode.MERCHANT_MISSING
      );
    });

    it("Should throw error >> merchant order id missing", () => {
      const orderOpts: any = {
        amount: "20",
        merchant: {
          desc: "Something",
        },
      };
      expect(order.create.bind(order, orderOpts)).to.throw(
        ErrorCode.MERCHANT_MISSING
      );
    });
  });
});
