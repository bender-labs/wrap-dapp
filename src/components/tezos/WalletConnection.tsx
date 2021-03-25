import React from 'react';
import { makeStyles } from '@material-ui/core';
import WalletConnectionCard from '../wallet/WalletConnectionCard';
import { SupportedBlockchain } from '../../features/wallet/blockchain';
import Icon from './Icon';
import { RequestPermissionInput } from '@airgap/beacon-sdk';
import {
  ConnectionActions,
  connectionStatusInitialState,
  connectionStatusReducer,
} from '../../features/wallet/connectionStatus';
import { ConnectionStatus as TezosConnectionStatus } from '../tezos/TezosContext';
import { useSnackbar } from 'notistack';
import { useTezosConfig } from '../config/ConfigContext';

const useStyles = makeStyles((theme) => ({}));

type Props = {
  account: undefined | string;
  activate: (args: RequestPermissionInput) => Promise<string>;
  status: TezosConnectionStatus;
};

export default function WalletConnection({ account, activate, status }: Props) {
  const { rpcUrl, networkId, networkName } = useTezosConfig();
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();
  const [connectionStatus, dispatchConnectionAction] = React.useReducer(
    connectionStatusReducer,
    connectionStatusInitialState(status === TezosConnectionStatus.CONNECTED)
  );

  const handleConnection = () => {
    dispatchConnectionAction({ type: ConnectionActions.launchingConnection });
    activate({
      network: {
        type: networkId,
        rpcUrl,
      },
    })
      .then((_) => {
        dispatchConnectionAction({
          type: ConnectionActions.connectionSuccessful,
        });
      })
      .catch((error) => {
        enqueueSnackbar(error, { variant: 'error' }); //@todo: humanize
      });
  };

  return (
    <React.Fragment>
      <WalletConnectionCard
        blockchain={SupportedBlockchain.Tezos}
        blockchainIcon={<Icon />}
        connectionStatus={connectionStatus}
        providers={[{ name: 'Beacon', key: 'beacon', icon: '' }]}
        onSelectedProvider={handleConnection}
        networkName={networkId == null ? 'Not connected' : networkName}
        account={account}
      />
    </React.Fragment>
  );
}
