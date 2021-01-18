import React, {ReactNode, useState} from "react";
import {Button, Card, CardActions, CardContent, CardHeader, makeStyles} from "@material-ui/core";
import {humanizeSupportedBlockchain, ProviderList, SupportedBlockchain} from "../../features/wallet/blockchain";
import {ConnectionStatus, humanizeConnectionStatus} from "../../features/wallet/connectionStatus";
import DisplayIcon from "./DisplayIcon";
import ProviderSelectionDialog from "./ProviderSelectionDialog";

type Props = {
  blockchain: SupportedBlockchain,
  blockchainIcon: ReactNode,
  connectionStatus: ConnectionStatus,
  providers: ProviderList,
  onSelectedProvider: (key: string) => void,
  networkName: string
}

const useStyles = makeStyles((theme) => ({
  cardContent: {
    textAlign: "center"
  }
}));

export default ({blockchain, blockchainIcon, connectionStatus, providers, onSelectedProvider, networkName}: Props) => {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const blockchainName = humanizeSupportedBlockchain(blockchain);

  const handleSelectedProvider = (key: string) => {
    setOpen(false);
    onSelectedProvider(key);
  }

  return (
    <React.Fragment>
      <Card>
        <CardHeader
          title={blockchainName}
          avatar={blockchainIcon}
          subheader={humanizeConnectionStatus(connectionStatus, networkName)}/>
        <CardContent className={classes.cardContent}>
          <DisplayIcon status={connectionStatus}/>
        </CardContent>
        {connectionStatus !== ConnectionStatus.CONNECTED &&
        <CardActions>
          <Button
            variant="contained"
            size="small"
            color="primary"
            disabled={connectionStatus === ConnectionStatus.CONNECTING}
            onClick={() => setOpen(true)}
          >
            Connect
          </Button>
        </CardActions>
        }
      </Card>
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