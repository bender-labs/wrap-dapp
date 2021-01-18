import React from 'react';
import {Web3ReactProvider} from '@web3-react/core';
import './App.css';
import {getLibrary} from "./features/ethereum/web3React";

import {SnackbarProvider} from "notistack";
import {Box, Container, CssBaseline} from "@material-ui/core";
import AppBar from "./screens/AppBar";
import Swap from "./screens/Swap";


function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <SnackbarProvider autoHideDuration={6000}>
        <CssBaseline/>
        <Container maxWidth="lg">
          <AppBar/>
          <Box mt={4}>
            <Swap/>
          </Box>
        </Container>
      </SnackbarProvider>
    </Web3ReactProvider>
  );
}

export default App;
