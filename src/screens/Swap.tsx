import {Grid} from "@material-ui/core";
import EthWalletConnection from "../components/ethereum/WalletConnection";
import TezosWalletConnection from "../components/tezos/WalletConnection";

export default () => {
  return (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid item xs={3}>
        <EthWalletConnection />
      </Grid>
      <Grid item xs={6} container>

      </Grid>
      <Grid item xs={3}>
        <TezosWalletConnection />
      </Grid>
    </Grid>
  )
}