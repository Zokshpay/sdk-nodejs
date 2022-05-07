import { Connector } from "./connector";
import { Order } from "./modules/order";

const PATHS = {
  ORDER_CREATE: "/v2/order",
  VALIDATE_PAYMENT: "/v2/validate-payment",
};
export class Moopay {
  connector: Connector;
  _order: Order;
  constructor(mooKey: string, mooSecret: string, testnet: boolean = true) {
    if (!mooKey) {
      throw new Error("Moopay key missing");
    }
    if (!mooSecret) {
      throw new Error("Moopay secret missing");
    }
    this.connector = new Connector(mooKey, mooSecret, testnet);
    this._order = new Order(this.connector);
  }

  get order(): Order {
    return this._order;
  }

  createOrder = async (body: any) => {
    return this.connector.signAndSend(PATHS.ORDER_CREATE, body);
  };

  validatePayment = async (transactionHash: string) => {
    return this.connector.signAndSend(PATHS.VALIDATE_PAYMENT, {
      transaction: transactionHash,
    });
  };
}
