import React, { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useTezosContext } from '../../components/tezos/TezosContext';
import { useConfig } from '../../runtime/config/ConfigContext';
import WrapCardContent from './WrapCardContent';
import { Box } from '@material-ui/core';
import MultiConnect from '../wallet/MultiConnect';

export default function WrapCard() {
  const {
    library: ethLibrary,
    account: ethAccount,
  } = useWeb3React<Web3Provider>();
  const { account: tzAccount, library: tezosLibrary } = useTezosContext();
  const { fungibleTokens } = useConfig();

  useEffect(() => {}, [fungibleTokens]);
  return (
    <Box>
      <WrapCardContent tokens={fungibleTokens} />
      <MultiConnect />
    </Box>
  );
}