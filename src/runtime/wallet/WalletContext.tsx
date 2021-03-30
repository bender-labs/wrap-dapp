import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import {
  TezosConnectionStatus,
  useTezosContext,
} from '../../components/tezos/TezosContext';
import { TezosToolkit } from '@taquito/taquito';
import { useEthereumConfig, useTezosConfig } from '../config/ConfigContext';
import connectorsFactory, {
  EthConnectors,
} from '../../features/ethereum/connectorsFactory';
import { InjectedConnector } from '@web3-react/injected-connector';
import {
  ConnectionActions,
  ConnectionStatus,
  connectionStatusInitialState,
  connectionStatusReducer,
} from '../../features/wallet/connectionStatus';

type ContextValue =
  | undefined
  | {
      fullySetup: boolean;
      ethereum: {
        library?: any;
        activate: (connectorKey: string) => Promise<void>;
        deactivate: () => void;
        account?: string;
        status: ConnectionStatus;
        connectors: EthConnectors;
      };
      tezos: {
        library?: TezosToolkit;
        activate: () => Promise<void>;
        status: ConnectionStatus;
        account?: string;
      };
    };

const WalletContext = React.createContext<ContextValue>(undefined);

export function useWalletContext() {
  const wallet = React.useContext(WalletContext);
  if (wallet == null)
    throw new Error('wallet consumer must be used within a wallet provider');
  return wallet;
}

export default function Provider({ children }: PropsWithChildren<{}>) {
  const {
    activate: ethActivate,
    library: ethLibrary,
    account: ethAccount,
    active: ethActive,
    deactivate: ethDeactivate,
  } = useWeb3React();
  const {
    library: tzLibrary,
    activate: tzActivate,
    status: tezosConnectionStatus,
    account: tzAccount,
  } = useTezosContext();
  const ethereumConfig = useEthereumConfig();
  const { rpcUrl, networkId } = useTezosConfig();
  const connectors = connectorsFactory(ethereumConfig);

  const activateTzConnection = () => {
    tzDispatchConnectionAction({ type: ConnectionActions.launchingConnection });
    return tzActivate({
      network: {
        type: networkId,
        rpcUrl,
      },
    })
      .then((_) => {
        tzDispatchConnectionAction({
          type: ConnectionActions.connectionSuccessful,
        });
      })
      .catch((error) => {
        tzDispatchConnectionAction({
          type: ConnectionActions.connectionFailed,
        });
        throw error;
      });
  };

  const activateEthConnection = (key: string) => {
    ethDispatchConnectionAction({
      type: ConnectionActions.launchingConnection,
    });
    return ethActivate(
      connectors[key as keyof typeof connectors].connector,
      (_) => null,
      true
    )
      .then(() =>
        ethDispatchConnectionAction({
          type: ConnectionActions.connectionSuccessful,
        })
      )
      .catch((error) => {
        ethDispatchConnectionAction({
          type: ConnectionActions.connectionFailed,
        });
        throw error;
      });
  };

  const deactivateEthConnection = () => {
    ethDeactivate();
    ethDispatchConnectionAction({
      type: ConnectionActions.stoppingConnection,
    });
  };

  const [wallet, setWallet] = useState<ContextValue>({
    fullySetup: false,
    ethereum: {
      activate: activateEthConnection,
      deactivate: deactivateEthConnection,
      connectors,
      status: ConnectionStatus.NOT_CONNECTED,
    },
    tezos: {
      account: undefined,
      activate: activateTzConnection,
      status: ConnectionStatus.NOT_CONNECTED,
    },
  });
  const [tzConnectionStatus, tzDispatchConnectionAction] = React.useReducer(
    connectionStatusReducer,
    connectionStatusInitialState(
      tezosConnectionStatus === TezosConnectionStatus.CONNECTED
    )
  );
  const [ethConnectionStatus, ethDispatchConnectionAction] = React.useReducer(
    connectionStatusReducer,
    connectionStatusInitialState(ethActive)
  );
  useEffect(() => {
    setWallet((prevState) => ({
      fullySetup: !(
        !ethActive ||
        ethLibrary == null ||
        ethAccount == null ||
        tzConnectionStatus === ConnectionStatus.NOT_CONNECTED ||
        tzAccount == null ||
        tzLibrary == null
      ),
      ethereum: {
        library: ethLibrary,
        activate: prevState!.ethereum.activate,
        deactivate: prevState!.ethereum.deactivate,
        account: ethAccount!,
        connectors: prevState!.ethereum.connectors,
        status: ethConnectionStatus,
      },
      tezos: {
        library: tzLibrary,
        activate: prevState!.tezos.activate,
        status: tzConnectionStatus,
        account: tzAccount,
      },
    }));
  }, [
    ethLibrary,
    ethActivate,
    ethAccount,
    ethConnectionStatus,
    ethActive,
    tzLibrary,
    tzActivate,
    tzConnectionStatus,
    tzAccount,
  ]);

  useEffect(() => {
    (connectors.injected.connector as InjectedConnector)
      .isAuthorized()
      .then((isAuthorized: boolean) => {
        if (isAuthorized) {
          activateEthConnection('injected').catch(() => {});
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}
