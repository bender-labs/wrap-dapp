import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { formatAmount } from '../../features/ethereum/token';
import BigNumber from 'bignumber.js';
import { grey } from '@material-ui/core/colors';
import { Fees } from '../../config';
import { wrapFees } from '../../features/fees/fees';

type Props = {
  fees: Fees;
  decimals: number;
  symbol: string;
  amountToWrap: BigNumber;
};

const useStyles = makeStyles((theme) => ({
  helperText: {
    color: grey[600],
    display: 'block',
    margin: '5 0',
  },
}));

export default function WrapFees({
  fees,
  amountToWrap,
  decimals,
  symbol,
}: Props) {
  const classes = useStyles();
  const currentFees = wrapFees(amountToWrap, fees);

  return (
    <>
      <Typography variant="caption" className={classes.helperText}>
        Fees: {formatAmount(symbol, currentFees, decimals)}
      </Typography>
      <Typography variant="caption" className={classes.helperText}>
        Amount you'll receive:{' '}
        {formatAmount(symbol, amountToWrap.minus(currentFees), decimals)}
      </Typography>
    </>
  );
}
