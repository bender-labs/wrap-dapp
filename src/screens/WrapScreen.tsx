import { Grid, makeStyles, Paper } from '@material-ui/core';
import EthWalletConnection from '../components/ethereum/WalletConnection';
import TezosWalletConnection from '../components/tezos/WalletConnection';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import React, { useEffect, useState } from 'react';
import { useTezosContext } from '../components/tezos/TezosContext';
import TokenSelection from '../components/wrap/TokenSelection';
import { SupportedBlockchain } from '../features/wallet/blockchain';
import { useConfig } from '../components/config/ConfigContext';
import AmountToWrapInput from '../components/wrap/AmountToWrapInput';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    padding: theme.spacing(2),
    flex: 1,
  },
}));

const Render = () => {
  const classes = useStyles();
  const {
    activate: ethActivate,
    active: ethActive,
    account: ethAccount,
  } = useWeb3React<Web3Provider>();
  const {
    activate: tzActivate,
    status: tzConnectionStatus,
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
export default Render;
