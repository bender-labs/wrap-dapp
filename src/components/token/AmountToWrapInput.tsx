import {InputAdornment, TextField} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {formatAmount, formatUnits, parseUnits,} from '../../features/ethereum/token';
import BigNumber from 'bignumber.js';

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
  const [userAmount, setUserAmount] = useState<string>(formatUnits(amountToWrap, decimals));
  const [[error, helperText], setUserError] = useState<[boolean, string]>([false, ""]);

  useEffect(() => {
    const timeOutId = setTimeout(() => validateFormat(userAmount), 300);
    return () => clearTimeout(timeOutId);
  }, [userAmount]);

  useEffect(() => {
    if (displayBalance && !error) {
      setUserError([false, `balance: ${formatAmount(symbol, balance, decimals)}`])
    }
  }, [displayBalance, balance, error]);

  const validateFormat = (input: string) => {
    if (!/^\d*(\.\d+)?$/.test(input)) {
      setUserError([true, "Invalid number"]);
      return;
    }

    try {
      const newBalance = parseUnits(input, decimals);
      if (displayBalance && newBalance.gt(balance)) {
        setUserError([true, `Insufficient Balance of ${formatAmount(symbol, balance, decimals)}`])
      }
      onChange(newBalance);
    } catch (e) {
      setUserError([true, "Wrong number format"]);
    }
  }

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (error) {
      setUserError([false, '']);
    }
    const value = event.target.value === '' ? '0' : event.target.value;
    const cleaned = value.replace(',', '.').replace(' ', '');
    setUserAmount(cleaned);
  };

  return (
    <TextField
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
    />
  );
}
