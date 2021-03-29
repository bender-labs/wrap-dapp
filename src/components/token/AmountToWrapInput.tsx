import { InputAdornment, TextField } from '@material-ui/core';
import React from 'react';
import {
  formatAmount,
  formatUnits,
  parseUnits,
} from '../../features/ethereum/token';
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
  const error = amountToWrap.gt(balance);
  const helperText = amountToWrap.gt(balance)
    ? `Insufficient Balance of ${formatAmount(symbol, balance, decimals)}`
    : `balance: ${formatAmount(symbol, balance, decimals)}`;

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.target.value === '' ? '0' : event.target.value;
    if (!/^\d*(\.\d+)?$/.test(value)) return;
    onChange(parseUnits(value, decimals));
  };

  return (
    <TextField
      error={error}
      id="amount-to-wrap"
      value={formatUnits(amountToWrap, decimals)}
      onChange={handleOnChange}
      helperText={displayBalance ? helperText : ''}
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
