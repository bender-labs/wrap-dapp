import React, {ReactNode, useState} from "react";
import {Button, Chip, Grid, makeStyles, Paper, Typography} from "@material-ui/core";
import {humanizeSupportedBlockchain, ProviderList, SupportedBlockchain} from "../../features/wallet/blockchain";
import {ConnectionStatus, humanizeConnectionStatus} from "../../features/wallet/connectionStatus";
import ProviderSelectionDialog from "./ProviderSelectionDialog";

type Props = {
  blockchain: SupportedBlockchain,
  blockchainIcon: ReactNode,
  connectionStatus: ConnectionStatus,
  providers: ProviderList,
  onSelectedProvider: (key: string) => void,
  networkName: string,
  account: string | null | undefined
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
  },
  mainContent: {
    flexGrow: 1
  },
  cardContent: {
    textAlign: "center"
  }
}));

export default ({
                  blockchain,
                  blockchainIcon,
                  connectionStatus,
                  providers,
                  onSelectedProvider,
                  networkName,
                  account
                }: Props) => {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const blockchainName = humanizeSupportedBlockchain(blockchain);

  const handleSelectedProvider = (key: string) => {
    setOpen(false);
    onSelectedProvider(key);
  }

  return (
    <React.Fragment>
      <Paper className={classes.root}>
        <Grid container justify="space-between" spacing={2} alignItems="center">
          <Grid item>
            {blockchainIcon}
          </Grid>
          <Grid item className={classes.mainContent}>
            <Typography variant="subtitle1" display="block">{blockchainName}</Typography>
            <Typography variant="caption"
                        display="block">{humanizeConnectionStatus(connectionStatus, networkName)}</Typography>
          </Grid>
          <Grid item>
            {connectionStatus === ConnectionStatus.CONNECTED && account != null
              ? (
                <Chip
                  label={account}
                  color="primary"
                  variant="outlined"
                />
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  disabled={connectionStatus === ConnectionStatus.CONNECTING}
                  onClick={() => handleSelectedProvider("injected")}
                  //onClick={() => setOpen(true)}
                >
                  Connect
                </Button>
              )}
          </Grid>
        </Grid>
      </Paper>
      <ProviderSelectionDialog
        open={isOpen}
        onClose={() => setOpen(false)}
        onSelectedValue={handleSelectedProvider}
        providers={providers}
        blockchain={blockchainName}
      />
    </React.Fragment>
  );
}