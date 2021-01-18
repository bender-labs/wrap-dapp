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
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import SwapCardEmptyState from "./SwapCardEmptyState";
import TokenIcon from "../ethereum/TokenIcon";
type Props = {}

const useStyles = makeStyles((theme) => ({
  swapContainer:{
    flex: 1
  },
  form: {
    width: "100%"
  }
}));

export default function SwapCard({}: Props) {
  const classes = useStyles();
  const {tokens, benderCustodianContracts} = useEthereumConfig();
  const {activate, active, account, chainId} = useWeb3React<Web3Provider>()
  const [token, setToken] = useState();

  if(!active || chainId == null ){
    return <SwapCardEmptyState />;
  }

  const tokenList = tokens[chainId];
  const tokenOptions = Object.entries(tokenList);
  const benderContract = tokens[chainId];
  return (
      <Card className={classes.swapContainer}>
        <CardHeader
          title="Swap"
          avatar={<SwapHorizontalCircleIcon />}
          subheader="A BenderLabs 🤖 project" />
        <CardContent >
          <FormControl className={classes.form}>
            <InputLabel shrink htmlFor="token-selector">
              Select the token you want to swap
            </InputLabel>
            <Select
              value={token}
              onChange={e => alert(e)}
              displayEmpty
              inputProps={{
                name: 'token',
                id: 'token-selector',
              }}
            >
                <MenuItem value={undefined} disabled>Please select</MenuItem>
              {tokenOptions.map(([key, {name}]) => (
                <MenuItem value={key} key={key}>
                  <ListItemIcon>
                    <TokenIcon fontSize="small" token={key} />
                  </ListItemIcon>
                  {name} ({key})
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Only supported token are listed</FormHelperText>
          </FormControl>
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