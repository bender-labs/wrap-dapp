import {
  Dialog,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import { ProviderList } from '../../features/wallet/blockchain';

const useStyles = makeStyles(() => ({
  icon: {
    width: 32,
    height: 32,
  },
}));

type SimpleDialogProps = {
  providers: ProviderList;
  open: boolean;
  onSelectedValue: (key: string) => void;
  onClose: () => void;
  blockchain: string;
};

const Render = ({
  onClose,
  onSelectedValue,
  open,
  providers,
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
      <List>
        {providers.map(({ name, key, icon }) => (
          <ListItem button onClick={() => onSelectedValue(key)} key={key}>
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
