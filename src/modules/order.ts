import { ApiResource } from "./ApiResource";

type Prefill = {
  name?: string;
  email?: string;
  phone?: string;
};

type Merchant = {
  orderId: string;
  desc?: string;
  extra?: string;
};

type Route = {
  autoSettle?: boolean;
};

export type OrderType = {
  prefill?: Prefill;
  fiat?: string;
  amount: string;
  token?: string;
  preferredCurrency?: string;
  mandatoryCurrency?: string;
  preferredChain?: string;
  mandatoryChain?: string;
  label?: string;
  merchant: Merchant;
  product?: string;
  route?: string;
};

type OrderResponse = {
  orderId: string;
  createdAt: number;
};

export const ErrorCode = {
  INVALID_AMOUNT: "invalid-amount",
  MERCHANT_MISSING: "merchant-order-missing",
};

export const PATH_CREATE = "/v2/order";

export class Order extends ApiResource {
  create(info: OrderType) {
    if (!info.amount || info.amount.trim() == "") {
      throw new Error(ErrorCode.INVALID_AMOUNT);
    }
    try {
      const am = parseFloat(info.amount);
      if (isNaN(am) || am < 0) {
        throw new Error(ErrorCode.INVALID_AMOUNT);
      }
    } catch (e) {
      throw e;
    }
    if (!info.merchant) {
      throw new Error(ErrorCode.MERCHANT_MISSING);
    }
    if (!info.merchant.orderId) {
      throw new Error(ErrorCode.MERCHANT_MISSING);
    }

    return this.connector.signAndSend(PATH_CREATE, info);
  }
}
