import {makeStyles, Typography} from "@material-ui/core";
import React from "react";
import {formatAmount} from "../../features/ethereum/token";
import BigNumber from "bignumber.js";
import {grey} from "@material-ui/core/colors";
import {Fees} from "../../config";

type Props = {
  fees: Fees;
  decimals: number;
  symbol: string;
  amountToWrap: BigNumber
};

const useStyles = makeStyles((theme) => ({
  helperText: {
    color: grey[600],
    display: "block",
    margin: "5 0"
  }
}));


export default function FeesToPay({fees, amountToWrap, decimals, symbol}: Props) {
  const classes = useStyles();

  return (
    <Typography variant="caption" className={classes.helperText}>
        Fees: {formatAmount(symbol, amountToWrap.div(10000).multipliedBy(fees.erc20WrappingFees), decimals)}
    </Typography>
  )
}