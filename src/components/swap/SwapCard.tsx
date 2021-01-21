import React, {useState} from "react"
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
import {EthereumERC20Contract} from "../../features/ethereum/contract";
import {ethereumConfigForCurrentChain} from "../../config";
import {BigNumber, ethers} from "ethers";

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
  const erc20ContractFor = EthereumERC20Contract.withProvider(web3Provider);
  const [contract, setContract] = useState<EthereumERC20Contract>();
  const [balance, setBalance] = useState<{balance: ethers.BigNumber, decimals: number}>();
  const [allowance, setAllowance] = useState<number>();

  const refreshBalance = (c: EthereumERC20Contract) => {
    Promise.all([
      c.decimals(),
      c.balanceOf()
    ]).then(([decimals, balance]) => {
      setBalance({decimals, balance});
      console.log(decimals, balance)
    });
  }

  const refreshAllowance = (c: EthereumERC20Contract) => {
    c.allowance().then(setAllowance);
  }

  const onTokenChosen = (event: React.ChangeEvent<{ value: unknown }>) => {
    event.preventDefault();
    const tokenKey = event.target.value as string;
    const {address, name} = tokens[tokenKey]
    let ethereumERC20Contract = erc20ContractFor(address, tokenKey, name, benderContract, account);
    setContract(ethereumERC20Contract);
    refreshBalance(ethereumERC20Contract);
    refreshAllowance(ethereumERC20Contract);
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
            value={contract?.token() || ""}
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
        <h3>Balance: {ethers.utils.formatUnits(balance.balance, balance.decimals)}</h3>
        )}
        <br />
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          size="small"
          color="primary"
          disabled={false}
        >
          AUTHORIZE
        </Button>
        <Button
          variant="contained"
          size="small"
          color="primary"
          disabled={false}
        >
          SWAP
        </Button>
      </CardActions>
    </Card>
  )
}