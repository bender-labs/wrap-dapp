import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import './App.css';
import { getLibrary as getEthLibrary } from './features/ethereum/web3React';
import { getLibrary as getTezosLibrary } from './features/tezos/beacon';
import TezosProvider from './components/tezos/TezosContext';
import ConfigProvider from './runtime/config/ConfigContext';
import { SnackbarProvider } from 'notistack';
import { Box, Container, createMuiTheme, CssBaseline } from '@material-ui/core';
import AppBar from './components/header/AppBar';
import Wrap from './screens/Wrap';
import WrapScreen from './screens/WrapScreen';
import { ThemeProvider } from '@material-ui/core/styles';
import { themeOptions } from './runtime/theme/theme';

const theme = createMuiTheme(themeOptions);

function App() {
  return (
    <ConfigProvider>
      <Web3ReactProvider getLibrary={getEthLibrary}>
        <TezosProvider getLibrary={getTezosLibrary}>
          <ThemeProvider theme={theme}>
            <SnackbarProvider autoHideDuration={6000}>
              <CssBaseline />
              <AppBar />
              <Container maxWidth="sm">
                <Box mt={4}>
                  <WrapScreen />
                </Box>
                <Box mt={4}>
                  <Wrap />
                </Box>
              </Container>
            </SnackbarProvider>
          </ThemeProvider>
        </TezosProvider>
      </Web3ReactProvider>
    </ConfigProvider>
  );
}

export default App;
