import React from 'react';
import {Web3ReactProvider} from '@web3-react/core';
import './App.css';
import {getLibrary} from "./features/ethereum/web3React";
import connectorsFactory from "./features/ethereum/connectorsFactory";
import {ethereumConfig} from "./config";
import WalletConnection from "./components/ethereum/WalletConnection";
import {SnackbarProvider} from "notistack";

const {connectors, chainIdToNetworkName, supportedChainIds} = connectorsFactory(ethereumConfig);

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <SnackbarProvider autoHideDuration={6000}>
        <div className="App">
          <header className="App-header">
            <WalletConnection connectors={connectors}/>
          </header>
        </div>
        </SnackbarProvider>
    </Web3ReactProvider>
);
}

export default App;
