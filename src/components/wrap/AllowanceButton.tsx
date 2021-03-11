import {Button, makeStyles, Typography} from "@material-ui/core";
import React from "react";
import {ethers} from "ethers";
import {formatAmount} from "../../features/ethereum/token";
import {grey} from "@material-ui/core/colors";

type Props = {
  currentAllowance: ethers.BigNumber;
  balanceToWrap: ethers.BigNumber;
  decimals: number;
  onAuthorize: (allowance: ethers.BigNumber) => void;
  symbol: string;
};

const useStyles = makeStyles((theme) => ({
  helperText: {
    color: grey[600],
    display: "block",
    margin: "5 0"
  }
}));

export default function AllowanceButton({currentAllowance, balanceToWrap, decimals, onAuthorize, symbol}: Props) {
  const classes = useStyles();
  const {color, disabled, text} = balanceToWrap.lte(currentAllowance)
    ? {color: "primary", disabled: true, text: `Allowed ${formatAmount(symbol, currentAllowance, decimals)}`}
    : {color: "secondary", disabled: false, text: `Allow ${formatAmount(symbol, balanceToWrap, decimals)}`}

  const handleOnClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onAuthorize(balanceToWrap);
  }

  return (
    <div>
      <Typography variant="caption" className={classes.helperText}>
        Current Allowance: {formatAmount(symbol, currentAllowance, decimals)}
      </Typography>
      <Button
        variant="outlined"
        disabled={disabled}
        color={color as any}
        onClick={handleOnClick}
      >
        {text}
      </Button>
      <Typography variant="caption" className={classes.helperText}>
        The bender contract will be allowed to spend {formatAmount(symbol, balanceToWrap, decimals)} on your behalf.
      </Typography>
    </div>
  );
}
