import React, { useState } from 'react';
import { Button, Chip, makeStyles } from '@material-ui/core';
import {
  humanizeSupportedBlockchain,
  ProviderList,
  SupportedBlockchain,
} from '../../features/wallet/blockchain';
import { ConnectionStatus } from '../../features/wallet/connectionStatus';
import ProviderSelectionDialog from './ProviderSelectionDialog';
// import { ellipsizeAddress } from '../../features/wallet/address';
import EthereumIcon from '../ethereum/Icon';
import TezosIcon from '../tezos/Icon';

const useStyles = makeStyles(() => ({
  disabledConnectionButton: {
    '&.Mui-disabled': {
      borderColor: '#616161',
      color: '#616161',
    },
  },
  chip: {
    background: "#FFD000",
    padding: "5px 10px"
  }
}));

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
  onDisconnection: () => void;
  account: string | null | undefined;
};

const WalletConnectionCard = ({
  blockchain,
  connectionStatus,
  providers,
  onSelectedProvider,
  onDisconnection,
  account,
}: Props) => {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const blockchainName = humanizeSupportedBlockchain(blockchain);
  const handleSelectedProvider = (key: string) => {
    setOpen(false);
    onSelectedProvider(key);
  };
  const handleDisconnection = () => {
    setOpen(false);
    onDisconnection();
  };
  const handleClick = () =>
    blockchain === SupportedBlockchain.Ethereum
      ? setOpen(true)
      : handleSelectedProvider('injected');
  return (
    <React.Fragment>
      {connectionStatus === ConnectionStatus.CONNECTED && account != null ? (
        <Chip
          icon={blockchainIcon(blockchain)}
          label={"Connected"}
          onDelete={handleDisconnection}
          className={classes.chip}
        />
      ) : (
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          classes={{ disabled: classes.disabledConnectionButton }}
          disabled={connectionStatus === ConnectionStatus.CONNECTING}
          startIcon={blockchainIcon(blockchain)}
          onClick={handleClick}
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
