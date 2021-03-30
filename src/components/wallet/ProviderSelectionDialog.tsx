import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import { ProviderList } from '../../features/wallet/blockchain';
import { ConnectionStatus } from '../../features/wallet/connectionStatus';

const useStyles = makeStyles((theme) => ({
  icon: {
    width: 32,
    height: 32,
  },
  disconnectButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

type SimpleDialogProps = {
  providers: ProviderList;
  open: boolean;
  onSelectedValue: (key: string) => void;
  onDisconnection: () => void;
  onClose: () => void;
  blockchain: string;
  connectionStatus: ConnectionStatus;
};

const Render = ({
  onClose,
  onSelectedValue,
  onDisconnection,
  open,
  providers,
  connectionStatus,
}: SimpleDialogProps) => {
  const classes = useStyles();
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      maxWidth={'xs'}
      fullWidth={true}
    >
      <DialogTitle>
        Select your wallet
        {connectionStatus === ConnectionStatus.CONNECTED && (
          <Button
            color={'primary'}
            variant={'outlined'}
            size={'small'}
            className={classes.disconnectButton}
            onClick={onDisconnection}
          >
            Disconnect
          </Button>
        )}
      </DialogTitle>
      <List>
        {providers.map(({ name, key, icon }) => (
          <ListItem
            button
            onClick={() => onSelectedValue(key)}
            key={key}
            disabled={connectionStatus === ConnectionStatus.CONNECTED}
          >
            <ListItemText primary={name} />
            <img
              className={classes.icon}
              alt={name}
              src={`/static/images/${icon}`}
            />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};
export default Render;
