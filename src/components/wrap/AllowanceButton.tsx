import {Button, CircularProgress, makeStyles, Typography} from "@material-ui/core";
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
  loading: boolean;
};

const useStyles = makeStyles((theme) => ({
  helperText: {
    color: grey[600],
    display: "block",
    margin: "5 0"
  },
  buttonProgress: {
    color: "#000",
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
    width: 'fit-content'
  },
}));

export default function AllowanceButton({
                                          currentAllowance,
                                          balanceToWrap,
                                          decimals,
                                          onAuthorize,
                                          symbol,
                                          loading
                                        }: Props) {
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
      <div className={classes.wrapper}>
        <Button
          variant="outlined"
          disabled={disabled || loading}
          color={color as any}
          onClick={handleOnClick}
        >
          {text}
        </Button>
        {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
      </div>
      <Typography variant="caption" className={classes.helperText}>
        The bender contract will be allowed to spend {formatAmount(symbol, balanceToWrap, decimals)} on your behalf.
      </Typography>
    </div>
  );
}
