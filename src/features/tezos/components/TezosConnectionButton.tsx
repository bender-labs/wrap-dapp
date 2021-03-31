import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import TezosWalletConnection from '../../../components/tezos/WalletConnection';
import React from 'react';

export default function TezosConnectionButton() {
  const {
    tezos: {
      activate: tzActivate,
      deactivate: tzDeactivate,
      status: tzConnectionStatus,
      account: tzAccount,
    },
  } = useWalletContext();
  return (
    <TezosWalletConnection
      account={tzAccount}
      activate={tzActivate}
      deactivate={tzDeactivate}
      connectionStatus={tzConnectionStatus}
    />
  );
}
