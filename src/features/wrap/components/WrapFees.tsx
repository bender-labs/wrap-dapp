import {
  Card,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { formatAmount } from '../../ethereum/token';
import BigNumber from 'bignumber.js';
import { Fees } from '../../../config';
import { wrapFees } from '../../fees/fees';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

type Props = {
  fees: Fees;
  decimals: number;
  symbol: string;
  amountToWrap: BigNumber;
};

const useStyles = makeStyles((theme) => ({
  helperText: {
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
    <Card variant={'outlined'}>
      <CardContent>
        <Grid container>
          <Grid item xs={5}>
            <Typography>
              {formatAmount(symbol, amountToWrap, decimals)}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <ArrowForwardIcon />
          </Grid>
          <Grid item xs={5}>
            <Typography variant="caption" className={classes.helperText}>
              Fees: {formatAmount(symbol, currentFees, decimals)}
            </Typography>
            <Typography className={classes.helperText}>
              Wrapped amount:{' '}
              {formatAmount(symbol, amountToWrap.minus(currentFees), decimals)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
