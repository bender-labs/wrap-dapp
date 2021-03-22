import BigNumber from "bignumber.js";
import {Fees} from "../../config";

export function wrapFees(amount: BigNumber, fees: Fees) {
  return amount.div(10000).multipliedBy(fees.erc20WrappingFees)
}

export function unwrapFees(amount: BigNumber, fees: Fees) {
  return amount.div(10000).multipliedBy(fees.erc20UnwrappingFees)
}
