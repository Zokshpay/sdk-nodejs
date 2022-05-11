import { Connector } from "./connector";
import { Order } from "./modules/order";
import { Payment } from "./modules/payment";
import { Webhook } from "./modules/webhook";

const PATHS = {
  ORDER_CREATE: "/v2/order",
  VALIDATE_PAYMENT: "/v2/validate-payment",
};
export class Moopay {
  connector: Connector;
  _order: Order;
  _payment: Payment;
  _webhook: Webhook | undefined;

  constructor(mooKey: string, mooSecret: string, testnet: boolean = true) {
    if (!mooKey) {
      throw new Error("Moopay key missing");
    }
    if (!mooSecret) {
      throw new Error("Moopay secret missing");
    }
    this.connector = new Connector(mooKey, mooSecret, testnet);
    this._order = new Order(this.connector);
    this._payment = new Payment(this.connector);
  }

  get order(): Order {
    return this._order;
  }

  get payment(): Payment {
    return this._payment;
  }

  set webhookEndPoint(url: string) {
    try {
      const parsed = new URL(url);
      if (!this._webhook) {
        this._webhook = new Webhook(this.connector, parsed);
      }
    } catch (e) {
      throw e;
    }
  }

  get webhook(): Webhook {
    if (!this._webhook) {
      throw new Error(
        "Webhook end point not defined, please call moopay.webhookEndPoint() first"
      );
    }
    return this._webhook;
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
