import {Grid, makeStyles, Paper, Tab, Tabs, Typography} from "@material-ui/core";
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import EthWalletConnection from "../components/ethereum/WalletConnection";
import TezosWalletConnection from "../components/tezos/WalletConnection";
import SwapCard from "../components/swap/SwapCard";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import WrapEmptyStateCard from "../components/swap/WrapEmptyStateCard";
import React, {useState} from "react";

enum TabValues {
  WRAP,
  BURN
}

const useStyles = makeStyles(theme => ({
  wrapIcon: {
    verticalAlign: 'middle',
    display: 'inline-flex'
  },
  appContainer: {
    flex: 1
  }
}));

export default () => {
  const classes = useStyles();
  const {activate, active, library, account, chainId} = useWeb3React<Web3Provider>();
  const [activeTab, setActiveTab] = useState<TabValues>(TabValues.WRAP)

  const handleActiveTab = (event: React.ChangeEvent<{}>, newValue: TabValues) => {
    setActiveTab(newValue)
  }

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <EthWalletConnection account={account} activate={activate} active={active} chainId={chainId}/>
      </Grid>
      <Grid item>
        <TezosWalletConnection/>
      </Grid>
      <Grid item container>
        {!active || chainId == null || library == null || account == null
          ? <WrapEmptyStateCard/>
          : <>
            <Paper className={classes.appContainer}>
              <Tabs
                value={activeTab}
                indicatorColor="primary"
                textColor="primary"
                onChange={handleActiveTab}
                aria-label="Swap direction selector"
              >
                <Tab value={TabValues.WRAP} label={<Typography variant="subtitle1">ETH <ArrowForwardIcon
                  className={classes.wrapIcon}/> TEZOS</Typography>}/>
                <Tab value={TabValues.BURN} label={<Typography variant="subtitle1">TEZOS <ArrowForwardIcon
                  className={classes.wrapIcon}/> ETH</Typography>}/>
              </Tabs>
              {activeTab === TabValues.WRAP && <SwapCard web3Provider={library} chainId={chainId} account={account}/>}
            </Paper>
          </>
        }
      </Grid>
    </Grid>
  )
}