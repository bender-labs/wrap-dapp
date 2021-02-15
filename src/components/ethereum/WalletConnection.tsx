import React from "react";
import {useSnackbar} from "notistack";
import errorMessage from "../../features/ethereum/errorMessage";
import {
  ConnectionActions,
  connectionStatusInitialState,
  connectionStatusReducer
} from "../../features/wallet/connectionStatus";
import WalletConnectionCard from "../wallet/WalletConnectionCard";
import {ProviderList, SupportedBlockchain} from "../../features/wallet/blockchain";
import Icon from "./Icon";
import {useEthereumConfig} from "../config/ConfigContext";
import connectorsFactory from "../../features/ethereum/connectorsFactory";
import {AbstractConnector} from "@web3-react/abstract-connector";

type Props = {
  activate: (connector: AbstractConnector, onError?: (((error: Error) => void) | undefined), throwErrors?: (boolean | undefined)) => Promise<void>,
  active: boolean,
  account: string | null | undefined,
  chainId: number | undefined
}

export default function WalletConnection({activate, active, account, chainId}: Props) {
  const {connectors, chainIdToNetworkName} = connectorsFactory(useEthereumConfig())

  const {enqueueSnackbar} = useSnackbar();
  const [connectionStatus, dispatchConnectionAction] = React.useReducer(connectionStatusReducer, connectionStatusInitialState(active));

  const providers: ProviderList =
    Object.entries(connectors)
      .map<{ name: string, key: string }>(([key, value]) => ({name: value.name, key}));

  const onStartConnection = (key: string) => {
    dispatchConnectionAction({type: ConnectionActions.launchingConnection});
    activate(connectors[key].connector, _ => null, true)
      .then(() => dispatchConnectionAction({type: ConnectionActions.connectionSuccessful}))
      .catch(error => {
        const {message, variant} = errorMessage(error);
        dispatchConnectionAction({type: ConnectionActions.connectionFailed});
        enqueueSnackbar(message, {variant});
      });
  }

  return (
    <React.Fragment>
      <WalletConnectionCard
        blockchain={SupportedBlockchain.Ethereum}
        blockchainIcon={<Icon/>}
        connectionStatus={connectionStatus}
        providers={providers}
        onSelectedProvider={onStartConnection}
        networkName={chainId == null ? "Not Connected" : chainIdToNetworkName[chainId]}
        account={account}
      />
    </React.Fragment>
  );
}
