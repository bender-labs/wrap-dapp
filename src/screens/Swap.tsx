import {Grid} from "@material-ui/core";
import EthWalletConnection from "../components/ethereum/WalletConnection";
import TezosWalletConnection from "../components/tezos/WalletConnection";
import SwapCard from "../components/swap/SwapCard";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import SwapCardEmptyState from "../components/swap/SwapCardEmptyState";

export default () => {
  const {activate, active, library, account, chainId} = useWeb3React<Web3Provider>();

  return (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid item xs={3}>
        <EthWalletConnection />
      </Grid>
      <Grid item xs={6} container>
        {!active || chainId == null || library == null || account == null
          ? <SwapCardEmptyState />
          : <SwapCard web3Provider={library} chainId={chainId} account={account}/>
        }
      </Grid>
      <Grid item xs={3}>
        <TezosWalletConnection />
      </Grid>
    </Grid>
  )
}