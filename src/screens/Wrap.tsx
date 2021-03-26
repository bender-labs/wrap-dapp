import { Grid } from '@material-ui/core';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import React from 'react';
import {
  ConnectionStatus,
  useTezosContext,
} from '../components/tezos/TezosContext';
import { MintCard } from '../components/wrap/MintCard';
import { BurnCard } from '../components/unwrap/BurnCard';

const Wrap = () => {
  const {
    active: ethActive,
    library: ethLibrary,
    account: ethAccount,
  } = useWeb3React<Web3Provider>();
  const {
    status: tzConnectionStatus,
    library: tzLibrary,
    account: tzAccount,
  } = useTezosContext();

  return (
    <Grid container spacing={2} direction="column">
      {!ethActive ||
      ethLibrary == null ||
      ethAccount == null ||
      tzConnectionStatus === ConnectionStatus.UNINITIALIZED ||
      tzAccount == null ||
      tzLibrary == null ? (
        <React.Fragment />
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
        </>
      )}
    </Grid>
  );
};
export default Wrap;
