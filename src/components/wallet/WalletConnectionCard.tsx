import React, { ReactNode, useState } from 'react';
import { Button, Chip, makeStyles } from '@material-ui/core';
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

const useStyles = makeStyles((theme) => ({
  wallet: {
    color: 'rgba(0, 0, 0, 0.87)',
    borderColor: 'rgba(0, 0, 0, 0.87)',
  },
}));

type Props = {
  blockchain: SupportedBlockchain;
  blockchainIcon: ReactNode;
  connectionStatus: ConnectionStatus;
  providers: ProviderList;
  onSelectedProvider: (key: string) => void;
  networkName: string;
  account: string | null | undefined;
};

const WalletConnectionCard = ({
  blockchain,
  blockchainIcon,
  connectionStatus,
  providers,
  onSelectedProvider,
  account,
}: Props) => {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const blockchainName = humanizeSupportedBlockchain(blockchain);
  const handleSelectedProvider = (key: string) => {
    setOpen(false);
    onSelectedProvider(key);
  };
  return (
    <React.Fragment>
      {connectionStatus === ConnectionStatus.CONNECTED && account != null ? (
        <Chip
          icon={
            blockchain === SupportedBlockchain.Ethereum ? (
              <EthereumIcon className={classes.wallet} />
            ) : (
              <TezosIcon className={classes.wallet} />
            )
          }
          label={ellipsizeAddress(account)}
          variant="outlined"
          className={classes.wallet}
        />
      ) : (
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          disabled={connectionStatus === ConnectionStatus.CONNECTING}
          startIcon={blockchainIcon}
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
