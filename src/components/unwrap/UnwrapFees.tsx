import {makeStyles, Typography} from "@material-ui/core";
import React from "react";
import {formatAmount} from "../../features/ethereum/token";
import BigNumber from "bignumber.js";
import {grey} from "@material-ui/core/colors";
import {Fees} from "../../config";
import {unwrapFees} from "../../features/fees/fees";

type Props = {
  fees: Fees;
  decimals: number;
  symbol: string;
  amountToUnwrap: BigNumber
};

const useStyles = makeStyles((theme) => ({
  helperText: {
    color: grey[600],
    display: "block",
    margin: "5 0"
  }
}));

export default function UnwrapFees({fees, amountToUnwrap, decimals, symbol}: Props) {
  const classes = useStyles();
  const currentFees = unwrapFees(amountToUnwrap, fees);

  return (
      <>
        <Typography variant="caption" className={classes.helperText}>
            Fees: {formatAmount(symbol, currentFees, decimals)}
        </Typography>
        <Typography variant="caption" className={classes.helperText}>
            Total amount unwraped: {formatAmount(symbol, amountToUnwrap.plus(currentFees), decimals)}
        </Typography>
      </>
  )
}