import { ApiResource } from "./ApiResource";

export const ErrorCode = {
  TRANSACTION_MISSING: "transaction-missing",
};

export const PATH_VALIDATE = "/v2/validate-payment";

export class Payment extends ApiResource {
  validate(transactionHash: string) {
    if (!transactionHash || transactionHash.trim() == "") {
      throw new Error(ErrorCode.TRANSACTION_MISSING);
    }
    return this.connector.signAndSend(PATH_VALIDATE, {
      transaction: transactionHash,
    });
  }
}
