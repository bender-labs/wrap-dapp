import {InputAdornment, TextField} from "@material-ui/core";
import {ethers} from "ethers";
import React from "react";
import {formatAmount} from "../../features/ethereum/token";

type Props = {
  balance: ethers.BigNumber;
  decimals: number;
  symbol: string;
  onChange: (amount: ethers.BigNumber) => void;
  amountToWrap: ethers.BigNumber
};

export default function AmountToWrapInput({balance, amountToWrap, decimals, symbol, onChange}: Props) {

  const error = amountToWrap.gt(balance);
  const helperText = amountToWrap.gt(balance)
    ? `Insufficient Balance of ${(formatAmount(symbol, balance, decimals))}`
    : `Current balance: ${(formatAmount(symbol, balance, decimals))}`;

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.target.value === "" ? "0" : event.target.value;
    if(value.includes(",")) return;
    onChange(ethers.utils.parseUnits(value, decimals));
  }

  return (
    <TextField
      error={error}
      id="amount-to-wrap"
      value={ethers.utils.formatUnits(amountToWrap, decimals)}
      onChange={handleOnChange}
      helperText={helperText}
      aria-describedby="standard-weight-helper-text"
      InputProps={{
        startAdornment: <InputAdornment position="start">{symbol}</InputAdornment>,
      }}
    />
  )
}