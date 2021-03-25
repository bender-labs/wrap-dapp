import React, { ReactNode, useState } from 'react';
import { Button, Chip } from '@material-ui/core';
import {
  humanizeSupportedBlockchain,
  ProviderList,
  SupportedBlockchain,
} from '../../features/wallet/blockchain';
import { ConnectionStatus } from '../../features/wallet/connectionStatus';
import ProviderSelectionDialog from './ProviderSelectionDialog';

type Props = {
  blockchain: SupportedBlockchain;
  blockchainIcon: ReactNode;
  connectionStatus: ConnectionStatus;
  providers: ProviderList;
  onSelectedProvider: (key: string) => void;
  networkName: string;
  account: string | null | undefined;
};

const Render = ({
  blockchain,
  blockchainIcon,
  connectionStatus,
  providers,
  onSelectedProvider,
  account,
}: Props) => {
  const [isOpen, setOpen] = useState(false);
  const blockchainName = humanizeSupportedBlockchain(blockchain);

  const handleSelectedProvider = (key: string) => {
    setOpen(false);
    onSelectedProvider(key);
  };

  return (
    <React.Fragment>
      {connectionStatus === ConnectionStatus.CONNECTED && account != null ? (
        <Chip label={account} color="primary" variant="outlined" />
      ) : (
        <Button
          variant="outlined"
          color="primary"
          disabled={connectionStatus === ConnectionStatus.CONNECTING}
          startIcon={blockchainIcon}
          onClick={() =>
            blockchain === SupportedBlockchain.Ethereum
              ? setOpen(true)
              : handleSelectedProvider('injected')
          }
        >
          Connect your wallet
        </Button>
      )}
      <ProviderSelectionDialog
        open={isOpen}
        onClose={() => setOpen(false)}
        onSelectedValue={handleSelectedProvider}
        providers={providers}
        blockchain={blockchainName}
      />
    </React.Fragment>
  );
};
export default Render;
