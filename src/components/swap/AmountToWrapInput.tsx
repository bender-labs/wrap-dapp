import {InputAdornment, TextField} from "@material-ui/core";
import {ethers} from "ethers";
import React from "react";

type Props = {
  balance: ethers.BigNumber;
  decimals: number;
  token: string;
  onChange: (amount: ethers.BigNumber) => void;
  amountToWrap: ethers.BigNumber
};

export default function AmountToWrapInput({balance, amountToWrap, decimals, token, onChange}: Props) {

  const formattedBalance = `${token} ${ethers.utils.formatUnits(balance, decimals)}`;
  const error = amountToWrap.gt(balance);
  const helperText = error
    ? `Insufficient Balance of ${formattedBalance}`
    : `Current balance: ${formattedBalance}`;


  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.target.value == "" ? "0" : event.target.value;
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
      label="Amount to wrap"
      aria-describedby="standard-weight-helper-text"
      InputProps={{
        startAdornment: <InputAdornment position="start">{token}</InputAdornment>,
      }}
    />
  )
}