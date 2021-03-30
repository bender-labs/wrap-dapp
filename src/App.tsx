import React from 'react';
import './App.css';
import ConfigProvider from './runtime/config/ConfigContext';
import WalletProvider from './runtime/wallet/WalletContext';
import { SnackbarProvider } from 'notistack';
import { Box, Container, createMuiTheme, CssBaseline } from '@material-ui/core';
import AppBar from './components/header/AppBar';
import WrapScreen from './screens/WrapScreen';
import HistoryScreen from './screens/HistoryScreen';
import Wrap from './screens/Wrap';
import { ThemeProvider } from '@material-ui/core/styles';
import { themeOptions } from './runtime/theme/theme';
import { RecoilRoot } from 'recoil';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { getLibrary as getEthLibrary } from './features/ethereum/web3React';
import TezosProvider from './components/tezos/TezosContext';
import { getLibrary as getTezosLibrary } from './features/tezos/beacon';
import { Web3ReactProvider } from '@web3-react/core';

const theme = createMuiTheme(themeOptions);

function App() {
  return (
    <ConfigProvider>
      <Web3ReactProvider getLibrary={getEthLibrary}>
        <TezosProvider getLibrary={getTezosLibrary}>
          <WalletProvider>
            <ThemeProvider theme={theme}>
              <RecoilRoot>
                <Router>
                  <SnackbarProvider autoHideDuration={6000}>
                    <CssBaseline />
                    <AppBar />
                    <Container maxWidth="sm">
                      <Switch>
                        <Route path="/history">
                          <HistoryScreen />
                        </Route>
                        <Route path="/">
                          <Box mt={4}>
                            <WrapScreen />
                          </Box>
                          <Box mt={4}>
                            <Wrap />
                          </Box>
                        </Route>
                      </Switch>
                    </Container>
                  </SnackbarProvider>
                </Router>
              </RecoilRoot>
            </ThemeProvider>
          </WalletProvider>
        </TezosProvider>
      </Web3ReactProvider>
    </ConfigProvider>
  );
}

export default App;
