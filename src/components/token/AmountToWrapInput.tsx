import React, { useEffect, useState } from 'react';
import { formatAmount } from '../../features/ethereum/token';
import BigNumber from 'bignumber.js';
import AmountInput from '../form/AmountInput';
import { Link } from '@material-ui/core';

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
    if (!displayBalance) {
      setUserError([false, '']);
      return;
    }


    if (amountToWrap.gt(balance)) {
      setUserError([
        true,
        `Insufficient Balance of ${formatAmount(symbol, balance, decimals)}`,
      ]);
      return;
    }
    setUserError([
      false,
      `Balance: ${
        balance.isNaN() ? '' : formatAmount(symbol, balance, decimals)
      }`,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const setMax = () => {
    onChange(balance);
  };

  return (
    <>
      <AmountInput
        value={amountToWrap?.shiftedBy(-decimals).toString()}
        decimals={decimals}
        symbol={symbol}
        onChange={handleOnChange}
        error={error}
        focus
        helperText={<>{helperText}<Link color={'textPrimary'} onClick={setMax}>(Max)</Link></>}
      />

    </>
  );
}
