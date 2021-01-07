import {Grid} from "@material-ui/core";
import {ConnectorsList} from "../features/ethereum/connectorsFactory";
import EthWalletConnection from "../components/ethereum/WalletConnection";
import TezosWalletConnection from "../components/tezos/WalletConnection";


type Props = {
  connectors: ConnectorsList;
}

export default ({connectors}: Props) => {
  return (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid item xs={3}>
        <EthWalletConnection connectors={connectors} />
      </Grid>
      <Grid item xs={6} container>

      </Grid>
      <Grid item xs={3}>
        <TezosWalletConnection connectors={connectors} />
      </Grid>
    </Grid>
  )
}