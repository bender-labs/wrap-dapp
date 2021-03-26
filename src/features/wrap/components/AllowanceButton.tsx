import {
  Button,
  CircularProgress,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { formatAmount } from '../../ethereum/token';
import { grey } from '@material-ui/core/colors';
import BigNumber from 'bignumber.js';

type Props = {
  currentAllowance: BigNumber;
  balanceToWrap: BigNumber;
  decimals: number;
  onAuthorize: () => void;
  symbol: string;
  loading: boolean;
};

const useStyles = makeStyles((theme) => ({
  helperText: {
    color: grey[600],
    display: 'block',
    margin: '5 0',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
    zIndex: 99,
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
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

  const handleOnClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onAuthorize();
  };

  return (
    <div>
      <div className={classes.wrapper}>
        <Button
          variant="outlined"
          fullWidth
          disabled={disabled || loading}
          color={color as any}
          onClick={handleOnClick}
        >
          {text}
        </Button>
        {loading && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
      </div>
      <Typography variant="caption" className={classes.helperText}>
        Current Allowance: {formatAmount(symbol, currentAllowance, decimals)}
      </Typography>
      <Typography variant="caption" className={classes.helperText}>
        The locking contract will be allowed to spend{' '}
        {formatAmount(symbol, balanceToWrap, decimals)} on your behalf.
      </Typography>
    </div>
  );
}
