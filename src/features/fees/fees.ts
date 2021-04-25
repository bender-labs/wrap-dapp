import BigNumber from 'bignumber.js';
import { Fees } from '../../config';

export function wrapFees(amount: BigNumber, fees: Fees) {
  return amount.div(10000).multipliedBy(fees.erc20WrappingFees);
}

export function unwrapFees(amount: BigNumber, fees: Fees) {
  return amount.div(10000).multipliedBy(fees.erc20UnwrappingFees);
}

export function unwrapAmountsFromTotal(amount: BigNumber, fees: Fees) {
  const withoutFees = amount.div(
    new BigNumber(fees.erc20UnwrappingFees).div(10000).plus(1)
  );
  const bigNumber = amount.minus(withoutFees);
  return [
    withoutFees.decimalPlaces(0, BigNumber.ROUND_HALF_DOWN),
    bigNumber.decimalPlaces(0, BigNumber.ROUND_HALF_UP),
  ];
}
