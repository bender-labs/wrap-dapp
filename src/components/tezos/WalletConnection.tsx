import React from "react";
import {makeStyles} from "@material-ui/core";
import {ConnectorsList} from "../../features/ethereum/connectorsFactory";
import {ConnectionStatus} from "../../features/wallet/connectionStatus";
import WalletConnectionCard from "../wallet/WalletConnectionCard";
import {SupportedBlockchain} from "../../features/wallet/blockchain";
import Icon from "./Icon";

const useStyles = makeStyles((theme) => ({
}));

interface Props {
  connectors: ConnectorsList
}

export default function WalletConnection({connectors}: Props) {

  const classes = useStyles();

  return (
    <React.Fragment>
      <WalletConnectionCard
        blockchain={SupportedBlockchain.Tezos}
        blockchainIcon={<Icon />}
        connectionStatus={ConnectionStatus.NOT_CONNECTED}
        providers={[{name: "NOT IMPLEMENTED", key: "NOT_IMPLEMENTED"}]}
        onSelectedProvider={key => alert(key)}
      />
    </React.Fragment>
  );
}
