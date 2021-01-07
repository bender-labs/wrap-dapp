import React from "react";
import {ConnectorsList} from "../../features/ethereum/connectorsFactory";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
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

interface Props {
  connectors: ConnectorsList
}

export default function WalletConnection({connectors}: Props) {
  const {activate, active} = useWeb3React<Web3Provider>()
  const {enqueueSnackbar} = useSnackbar();

  const providers: ProviderList =
    Object.entries(connectors)
      .map<{ name: string, key: string }>(([key, value]) => ({name: value.name, key}));

  const [connectionStatus, dispatchConnectionAction] = React.useReducer(connectionStatusReducer, connectionStatusInitialState(active));

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
      />
    </React.Fragment>
  );
}