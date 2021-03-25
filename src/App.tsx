import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import './App.css';
import { getLibrary as getEthLibrary } from './features/ethereum/web3React';
import { getLibrary as getTezosLibrary } from './features/tezos/beacon';
import TezosProvider from './components/tezos/TezosContext';
import ConfigProvider from './components/config/ConfigContext';
import { SnackbarProvider } from 'notistack';
import { Box, Container, CssBaseline } from '@material-ui/core';
import AppBar from './screens/AppBar';
import Wrap from './screens/Wrap';
import WrapScreen from './screens/WrapScreen';

function App() {
  return (
    <ConfigProvider>
      <Web3ReactProvider getLibrary={getEthLibrary}>
        <TezosProvider getLibrary={getTezosLibrary}>
          <SnackbarProvider autoHideDuration={6000}>
            <CssBaseline />
            <AppBar />
            <Container maxWidth="md">
              <Box mt={4}>
                <Wrap />
                <WrapScreen />
              </Box>
            </Container>
          </SnackbarProvider>
        </TezosProvider>
      </Web3ReactProvider>
    </ConfigProvider>
  );
}

export default App;
