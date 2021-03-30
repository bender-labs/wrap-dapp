import { Grid } from '@material-ui/core';
import React from 'react';
import { BurnCard } from '../components/unwrap/BurnCard';
import { useWalletContext } from '../runtime/wallet/WalletContext';

const Wrap = () => {
  const {
    fullySetup,
    ethereum: { library: ethLibrary, account: ethAccount },
    tezos: { account: tzAccount, library: tzLibrary },
  } = useWalletContext();

  return (
    <Grid container spacing={2} direction="column">
      {!fullySetup ? (
        <React.Fragment />
      ) : (
        <>
          <Grid item>
            <BurnCard
              ethAccount={ethAccount!}
              tzAccount={tzAccount!}
              ethLibrary={ethLibrary}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};
export default Wrap;
