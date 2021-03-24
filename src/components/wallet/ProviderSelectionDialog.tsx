import {
    Dialog,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText
} from "@material-ui/core";
import {ProviderList} from "../../features/wallet/blockchain";

type SimpleDialogProps = {
  providers: ProviderList;
  open: boolean;
  onSelectedValue: (key: string) => void;
  onClose: () => void;
  blockchain: string;
}

export default ({ onClose, onSelectedValue, open, providers }: SimpleDialogProps) => {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={open}>
        <DialogTitle id="simple-dialog-title">Select your provider</DialogTitle>
        <DialogContent>
          <List>
            {providers.map(({name, key}) => (
              <ListItem button onClick={() => onSelectedValue(key)} key={key}>
                <ListItemText primary={name}/>
              </ListItem>
            ))}
          </List>
        </DialogContent>
    </Dialog>
  );
}
