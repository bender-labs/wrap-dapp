import {
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import EthWalletConnection from '../components/ethereum/WalletConnection';
import TezosWalletConnection from '../components/tezos/WalletConnection';
import SwapCard from '../components/wrap/SwapCard';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import WrapEmptyStateCard from '../components/wrap/WrapEmptyStateCard';
import React, { useState } from 'react';
import {
  ConnectionStatus,
  useTezosContext,
} from '../components/tezos/TezosContext';
import { MintCard } from '../components/wrap/MintCard';
import { BurnCard } from '../components/unwrap/BurnCard';
import UnwrapCard from '../components/unwrap/UnwrapCard';

enum TabValues {
  WRAP,
  BURN,
}

const useStyles = makeStyles((theme) => ({
  wrapIcon: {
    verticalAlign: 'middle',
    display: 'inline-flex',
  },
  appContainer: {
    flex: 1,
  },
}));

const Render = () => {
  const classes = useStyles();
  const {
    activate: ethActivate,
    active: ethActive,
    library: ethLibrary,
    account: ethAccount,
  } = useWeb3React<Web3Provider>();
  const {
    activate: tzActivate,
    status: tzConnectionStatus,
    library: tzLibrary,
    account: tzAccount,
  } = useTezosContext();
  const [activeTab, setActiveTab] = useState<TabValues>(TabValues.WRAP);

  const handleActiveTab = (
    event: React.ChangeEvent<{}>,
    newValue: TabValues
  ) => {
    setActiveTab(newValue);
  };
  if (tzLibrary != null) {
    console.log('launch');
    //mintErc20(tzLibrary);
  }

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <EthWalletConnection
          account={ethAccount}
          activate={ethActivate}
          active={ethActive}
        />
      </Grid>
      <Grid item>
        <TezosWalletConnection
          account={tzAccount}
          activate={tzActivate}
          status={tzConnectionStatus}
        />
      </Grid>
      {!ethActive ||
      ethLibrary == null ||
      ethAccount == null ||
      tzConnectionStatus === ConnectionStatus.UNINITIALIZED ||
      tzAccount == null ||
      tzLibrary == null ? (
        <Grid item container>
          <WrapEmptyStateCard />
        </Grid>
      ) : (
        <>
          <Grid item>
            <MintCard
              ethAccount={ethAccount}
              tzAccount={tzAccount}
              tzLibrary={tzLibrary}
            />
          </Grid>
          <Grid item>
            <BurnCard
              ethAccount={ethAccount}
              tzAccount={tzAccount}
              ethLibrary={ethLibrary}
            />
          </Grid>
          <Grid item container>
            <Paper className={classes.appContainer}>
              <Tabs
                value={activeTab}
                indicatorColor="primary"
                textColor="primary"
                onChange={handleActiveTab}
                aria-label="Swap direction selector"
              >
                <Tab
                  value={TabValues.WRAP}
                  label={
                    <Typography variant="subtitle1">
                      ETH <ArrowForwardIcon className={classes.wrapIcon} />{' '}
                      TEZOS
                    </Typography>
                  }
                />
                <Tab
                  value={TabValues.BURN}
                  label={
                    <Typography variant="subtitle1">
                      TEZOS <ArrowForwardIcon className={classes.wrapIcon} />{' '}
                      ETH
                    </Typography>
                  }
                />
              </Tabs>
              {activeTab === TabValues.WRAP && (
                <SwapCard
                  tzAccount={tzAccount}
                  ethLibrary={ethLibrary}
                  ethAccount={ethAccount}
                  tzLibrary={tzLibrary}
                />
              )}
              {activeTab === TabValues.BURN && (
                <UnwrapCard
                  tzAccount={tzAccount}
                  ethLibrary={ethLibrary}
                  ethAccount={ethAccount}
                  tzLibrary={tzLibrary}
                />
              )}
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
};
export default Render;
