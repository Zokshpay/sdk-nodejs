import { Connector } from "./connector";

const PATHS = {
  ORDER_CREATE: "/v2/order",
  VALIDATE_PAYMENT: "/v2/validate-payment",
};
export class Moopay {
  connector: Connector;
  constructor(mooKey: string, mooSecret: string, testnet: boolean = true) {
    this.connector = new Connector(mooKey, mooSecret, testnet);
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
