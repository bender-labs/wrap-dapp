import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import TezosWalletConnection from '../../../components/tezos/WalletConnection';
import React from 'react';

export default function TezosConnectionButton() {
  const {
    tezos: {
      activate: tzActivate,
      status: tzConnectionStatus,
      account: tzAccount,
    },
  } = useWalletContext();
  return (
    <TezosWalletConnection
      account={tzAccount}
      activate={tzActivate}
      connectionStatus={tzConnectionStatus}
    />
  );
}
