import EthWalletConnection from '../../../components/ethereum/WalletConnection';
import React from 'react';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';

export default function EthereumConnectionButton() {
  const {
    ethereum: {
      activate: ethActivate,
      deactivate: ethDeactivate,
      account: ethAccount,
      connectors: ethConnectors,
      status: ethConnectionStatus,
    },
  } = useWalletContext();

  return (
    <EthWalletConnection
      account={ethAccount}
      activate={ethActivate}
      deactivate={ethDeactivate}
      connectors={ethConnectors}
      connectionStatus={ethConnectionStatus}
    />
  );
}
