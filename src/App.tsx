import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import './App.css';
import { getLibrary as getEthLibrary } from './features/ethereum/web3React';
import { getLibrary as getTezosLibrary } from './features/tezos/beacon';
import TezosProvider from './components/tezos/TezosContext';
import ConfigProvider from './runtime/config/ConfigContext';
import WalletProvider from './runtime/wallet/WalletContext';
import { SnackbarProvider } from 'notistack';
import { Box, Container, createMuiTheme, CssBaseline } from '@material-ui/core';
import WrapScreen from './screens/WrapScreen';
import HistoryScreen from './screens/HistoryScreen';
import { ThemeProvider } from '@material-ui/core/styles';
import { themeOptions } from './runtime/theme/theme';
import { RecoilRoot } from 'recoil';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppBar from './components/header/AppBar';
import WrapFlow from './screens/WrapFlow';
import { paths } from './screens/routes';
import UnwrapFlow from './screens/UnwrapFlow';
import { WrapPaper } from './components/paper/Paper';

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
                        <Route path="/" exact>
                          <Box mt={4}>
                            <WrapScreen />
                          </Box>
                        </Route>
                        <WrapPaper>
                          <Route path={paths.WRAP} component={WrapFlow} />
                          <Route path={paths.UNWRAP} component={UnwrapFlow} />
                        </WrapPaper>
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
