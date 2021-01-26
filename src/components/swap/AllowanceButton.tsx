import {Button, makeStyles, Typography} from "@material-ui/core";
import React from "react";
import {ethers} from "ethers";
import {formatAmount} from "../../features/ethereum/token";
import {green, grey, orange} from "@material-ui/core/colors";

type Props = {
  currentAllowance: ethers.BigNumber;
  balanceToWrap: ethers.BigNumber;
  decimals: number;
  onAuthorize: (allowance: ethers.BigNumber) => void;
  token: string;
};

const useStyles = makeStyles((theme) => ({
  helperText: {
    color: grey[600],
    display: "block",
    margin: "5 0"
  }
}));

export default function AllowanceButton({currentAllowance, balanceToWrap, decimals, onAuthorize, token}: Props) {
  const classes = useStyles();
  const amountToAllow = balanceToWrap.sub(currentAllowance);
  const {color, disabled, text} = amountToAllow.lte(0)
    ? {color: "default", disabled: true, text: `Allowed ${formatAmount(token, currentAllowance, decimals)}`}
    : {color: "secondary", disabled: false, text: `Allow ${formatAmount(token, amountToAllow, decimals)}`}

  const handleOnClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onAuthorize(amountToAllow);
  }

  return (
    <div>
      <Typography variant="caption" className={classes.helperText}>
        Current Allowance: {formatAmount(token, currentAllowance, decimals)}
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
        The bender contract will be allowed to spend {formatAmount(token, balanceToWrap, decimals)} on your behalf.
      </Typography>
    </div>
  );
}
