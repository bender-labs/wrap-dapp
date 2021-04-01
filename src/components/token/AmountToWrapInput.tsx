import React, { useEffect, useState } from 'react';
import { formatAmount } from '../../features/ethereum/token';
import BigNumber from 'bignumber.js';
import AmountInput from '../form/AmountInput';

type Props = {
  balance: BigNumber;
  decimals: number;
  symbol: string;
  onChange: (amount: BigNumber) => void;
  amountToWrap: BigNumber;
  displayBalance: boolean;
};

export default function AmountToWrapInput({
  balance,
  amountToWrap,
  decimals,
  symbol,
  onChange,
  displayBalance,
}: Props) {
  const [[error, helperText], setUserError] = useState<[boolean, string]>([
    false,
    '',
  ]);

  useEffect(() => {
    if (displayBalance && !error) {
      setUserError([
        false,
        `balance: ${formatAmount(symbol, balance, decimals)}`,
      ]);
    }
  }, [decimals, symbol, displayBalance, balance, error]);

  const handleOnChange = (v: string) => {
    if (error) {
      setUserError([false, '']);
    }
    const newAmount = new BigNumber(v).shiftedBy(decimals);
    if (displayBalance && newAmount.gt(balance)) {
      setUserError([
        true,
        `Insufficient Balance of ${formatAmount(symbol, balance, decimals)}`,
      ]);
    }
    onChange(newAmount);
  };

  return (
    <>
      <AmountInput
        value={amountToWrap.shiftedBy(-decimals).toString()}
        decimals={decimals}
        symbol={symbol}
        onChange={handleOnChange}
        error={error}
        helperText={helperText}
      />
      {/*<TextField
        error={error}
        id="amount-to-wrap"
        value={userAmount}
        onChange={handleOnChange}
        helperText={helperText}
        aria-describedby="standard-weight-helper-text"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">{symbol}</InputAdornment>
          ),
        }}
      />*/}
    </>
  );
}
