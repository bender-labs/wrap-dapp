import React from "react"
import {Button, Card, CardActions, CardContent, CardHeader, makeStyles} from "@material-ui/core";
import SwapHorizontalCircleIcon from '@material-ui/icons/SwapHorizontalCircle';
import {useEthereumConfig} from "../config/ConfigContext";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import SwapCardEmptyState from "./SwapCardEmptyState";
type Props = {}

const useStyles = makeStyles((theme) => ({
  swapContainer:{
    flex: 1
  }
}));

export default function SwapCard({}: Props) {
  const classes = useStyles();
  const {tokens, benderCustodianContracts} = useEthereumConfig();
  const {activate, active, account, chainId} = useWeb3React<Web3Provider>()

  if(!active || chainId == null ){
    return <SwapCardEmptyState />;
  }

  const tokenList = tokens[chainId];
  const benderContract = tokens[chainId];
  return (
      <Card className={classes.swapContainer}>
        <CardHeader
          title="Swap"
          avatar={<SwapHorizontalCircleIcon />}
          subheader="A BenderLabs 🤖 project" />
        <CardContent >
          H2H2H2
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