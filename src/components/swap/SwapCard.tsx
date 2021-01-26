import React, {useEffect, useState} from "react"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControl, FormHelperText,
  InputLabel, ListItemIcon,
  makeStyles, MenuItem, Select
} from "@material-ui/core";
import SwapHorizontalCircleIcon from '@material-ui/icons/SwapHorizontalCircle';
import {useEthereumConfig} from "../config/ConfigContext";
import {Web3Provider} from "@ethersproject/providers";
import TokenIcon from "../ethereum/TokenIcon";
import {EthereumERC20ContractApi} from "../../features/ethereum/contract";
import {ethereumConfigForCurrentChain} from "../../config";
import {ethers} from "ethers";
import AmountToWrapInput from "./AmountToWrapInput";
import {EmptyToken, Token} from "../../features/swap/token";
import AllowanceButton from "./AllowanceButton";

type Props = {
  chainId: number;
  web3Provider: Web3Provider;
  account: string;
}

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1
  },
  form: {
    width: "100%"
  }
}));

export default function SwapCard({chainId, web3Provider, account}: Props) {
  const classes = useStyles();
  const {tokens, benderContract} = ethereumConfigForCurrentChain(useEthereumConfig())(chainId);
  const erc20ContractFor = EthereumERC20ContractApi.withProvider(web3Provider);

  const [{token, decimals, ethContractAddress, name}, setToken] = useState<Token>(EmptyToken);
  const [contract, setContract] = useState<EthereumERC20ContractApi>();
  const [balance, setBalance] = useState<ethers.BigNumber>();
  const [amountToWrap, setAmountToWrap] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [allowance, setAllowance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));

  useEffect(() => {
    if(token === "") return;
    setContract(erc20ContractFor(ethContractAddress, benderContract, account));
  }, [token]);

  useEffect(() => {
    if(contract == null) return;
    refreshAllowance();
    refreshBalance();
  }, [contract]);

  const refreshBalance = () => {
    contract?.balanceOf().then(setBalance);
  }

  const refreshAllowance = () => {
    contract?.allowance().then(setAllowance);
  }

  const onTokenChosen = (event: React.ChangeEvent<{ value: unknown }>) => {
    const tokenKey = event.target.value as string;
    setToken({...tokens[tokenKey], token: tokenKey});
  }

  const onApprove = (amount: ethers.BigNumber) => {
    contract?.approve(amount);
  }

  const tokenOptions = Object.entries(tokens);
  return (
    <Card className={classes.swapContainer}>
      <CardHeader
        title="Swap"
        avatar={<SwapHorizontalCircleIcon/>}
        subheader="A BenderLabs 🤖 project"/>
      <CardContent>
        <FormControl className={classes.form}>
          <InputLabel shrink htmlFor="token-selector">
            Select the token you want to swap
          </InputLabel>
          <Select
            value={token}
            onChange={onTokenChosen}
            displayEmpty
            inputProps={{
              name: 'token',
              id: 'token-selector',
            }}
          >
            <MenuItem value="" disabled>Please select</MenuItem>
            {tokenOptions.map(([key, {name}]) => (
              <MenuItem value={key} key={key}>
                <ListItemIcon>
                  <TokenIcon fontSize="small" token={key}/>
                </ListItemIcon>
                {name} ({key})
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Only supported token are listed</FormHelperText>
        </FormControl>
        {balance != null && (
          <AmountToWrapInput
            balance={balance}
            decimals={decimals}
            token={token}
            onChange={setAmountToWrap}
            amountToWrap={amountToWrap}
          />
        )}
        <br />
      </CardContent>
      {amountToWrap.gt(0) && (
      <CardActions>
        <AllowanceButton
          currentAllowance={allowance}
          balanceToWrap={amountToWrap}
          decimals={decimals}
          onAuthorize={onApprove}
          token={token} />
        <Button
          variant="contained"
          size="small"
          color="primary"
          disabled={false}
        >
          SWAP
        </Button>
      </CardActions>
      )}
    </Card>
  )
}