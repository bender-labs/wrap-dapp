import {Grid, makeStyles, Paper, Tab, Tabs, Typography} from "@material-ui/core";
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import EthWalletConnection from "../components/ethereum/WalletConnection";
import TezosWalletConnection from "../components/tezos/WalletConnection";
import SwapCard from "../components/swap/SwapCard";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import WrapEmptyStateCard from "../components/swap/WrapEmptyStateCard";
import React, {useState} from "react";
import {ConnectionStatus, useTezosContext} from "../components/tezos/TezosContext";

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
  const {activate: ethActivate, active: ethActive, library: ethLibrary, account: ethAccount} = useWeb3React<Web3Provider>();
  const {activate: tzActivate, status: tzConnectionStatus, library: tzLibrary, account: tzAccount} = useTezosContext();
  const [activeTab, setActiveTab] = useState<TabValues>(TabValues.WRAP)

  const handleActiveTab = (event: React.ChangeEvent<{}>, newValue: TabValues) => {
    setActiveTab(newValue)
  }

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <EthWalletConnection account={ethAccount} activate={ethActivate} active={ethActive} />
      </Grid>
      <Grid item>
        <TezosWalletConnection account={tzAccount} activate={tzActivate} status={tzConnectionStatus} />
      </Grid>
      <Grid item container>
        {!ethActive || ethLibrary == null || ethAccount == null || tzConnectionStatus === ConnectionStatus.UNINITIALIZED || tzAccount == null
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
              {activeTab === TabValues.WRAP && <SwapCard tzAccount={tzAccount} web3Provider={ethLibrary} ethAccount={ethAccount} beaconWallet={tzLibrary}/>}
            </Paper>
          </>
        }
      </Grid>
    </Grid>
  )
}