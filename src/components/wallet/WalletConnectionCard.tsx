import React, { useState } from 'react';
import { Button, Chip } from '@material-ui/core';
import {
  humanizeSupportedBlockchain,
  ProviderList,
  SupportedBlockchain,
} from '../../features/wallet/blockchain';
import { ConnectionStatus } from '../../features/wallet/connectionStatus';
import ProviderSelectionDialog from './ProviderSelectionDialog';
import { ellipsizeAddress } from '../../features/wallet/address';
import EthereumIcon from '../ethereum/Icon';
import TezosIcon from '../tezos/Icon';

const blockchainIcon = (blockchain: SupportedBlockchain) =>
  blockchain === SupportedBlockchain.Ethereum ? (
    <EthereumIcon />
  ) : (
    <TezosIcon />
  );

type Props = {
  blockchain: SupportedBlockchain;
  connectionStatus: ConnectionStatus;
  providers: ProviderList;
  onSelectedProvider: (key: string) => void;
  networkName: string;
  account: string | null | undefined;
};

const WalletConnectionCard = ({
  blockchain,
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
  const handleClick = () => {};
  return (
    <React.Fragment>
      {connectionStatus === ConnectionStatus.CONNECTED && account != null ? (
        <Chip
          icon={blockchainIcon(blockchain)}
          label={ellipsizeAddress(account)}
          onClick={handleClick}
        />
      ) : (
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          disabled={connectionStatus === ConnectionStatus.CONNECTING}
          startIcon={blockchainIcon(blockchain)}
          onClick={() =>
            blockchain === SupportedBlockchain.Ethereum
              ? setOpen(true)
              : handleSelectedProvider('injected')
          }
        >
          Connect
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
export default WalletConnectionCard;
