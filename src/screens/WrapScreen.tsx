import {
  Grid,
  makeStyles,
  Paper,
  StepContent,
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
import React, { useEffect, useState } from 'react';
import {
  ConnectionStatus,
  useTezosContext,
} from '../components/tezos/TezosContext';
import { MintCard } from '../components/wrap/MintCard';
import { BurnCard } from '../components/unwrap/BurnCard';
import UnwrapCard from '../components/unwrap/UnwrapCard';
import { grey } from '@material-ui/core/colors';
import TokenSelection from '../components/wrap/TokenSelection';
import { SupportedBlockchain } from '../features/wallet/blockchain';
import { useConfig } from '../components/config/ConfigContext';
import AmountToWrapInput from '../components/wrap/AmountToWrapInput';
import BigNumber from 'bignumber.js';

enum TabValues {
  WRAP,
  BURN,
}

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    padding: theme.spacing(2),
    flex: 1,
  },
}));

export default () => {
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
  const { fungibleTokens } = useConfig();
  const [token, setToken] = useState('');

  useEffect(() => {}, [token]);

  const [amountToWrap, setAmountToWrap] = useState<BigNumber>(new BigNumber(0));
  return (
    <Paper className={classes.swapContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <EthWalletConnection
            account={ethAccount}
            activate={ethActivate}
            active={ethActive}
          />
        </Grid>
        <Grid container item xs={12}>
          <Grid item xs={6}>
            <AmountToWrapInput
              balance={new BigNumber(0)}
              decimals={18}
              symbol={token}
              onChange={setAmountToWrap}
              amountToWrap={amountToWrap}
            />
          </Grid>
          <Grid item xs={6}>
            <TokenSelection
              token={token}
              onTokenSelect={setToken}
              tokens={fungibleTokens}
              blockchainTarget={SupportedBlockchain.Ethereum}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TezosWalletConnection
            account={tzAccount}
            activate={tzActivate}
            status={tzConnectionStatus}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
