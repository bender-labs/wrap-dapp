import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { formatAmount } from '../../ethereum/token';
import { grey } from '@material-ui/core/colors';
import BigNumber from 'bignumber.js';
import LoadableButton from '../../../components/button/LoadableButton';

type Props = {
  currentAllowance: BigNumber;
  balanceToWrap: BigNumber;
  decimals: number;
  onAuthorize: () => void;
  symbol: string;
  loading: boolean;
};

const useStyles = makeStyles(() => ({
  helperText: {
    color: grey[600],
    display: 'block',
    margin: '5 0',
  },
}));

export default function AllowanceButton({
  currentAllowance,
  balanceToWrap,
  decimals,
  onAuthorize,
  symbol,
  loading,
}: Props) {
  const classes = useStyles();
  const { color, disabled, text } = balanceToWrap.lte(currentAllowance)
    ? {
        color: 'primary',
        disabled: true,
        text: `Allowed ${formatAmount(symbol, currentAllowance, decimals)}`,
      }
    : {
        color: 'secondary',
        disabled: false,
        text: `Allow ${formatAmount(symbol, balanceToWrap, decimals)}`,
      };

  return (
    <LoadableButton
      loading={loading}
      onClick={onAuthorize}
      disabled={disabled}
      text={text}
      color={color}
    >
      <Typography variant="caption" className={classes.helperText}>
        Current Allowance: {formatAmount(symbol, currentAllowance, decimals)}
      </Typography>
      <Typography variant="caption" className={classes.helperText}>
        The locking contract will be allowed to spend{' '}
        {formatAmount(symbol, balanceToWrap, decimals)} on your behalf.
      </Typography>
    </LoadableButton>
  );
}
