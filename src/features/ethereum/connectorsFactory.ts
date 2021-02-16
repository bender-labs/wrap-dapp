import {InjectedConnector} from '@web3-react/injected-connector'
import {LedgerConnector} from '@web3-react/ledger-connector'
import {EthereumConfig} from "../../config";

export default function connectorsFactory({rpcUrl, networkId}: EthereumConfig) {
  const pollingInterval = 1200;
  return {
    injected: {
      name: "Browser Extension",
      connector: new InjectedConnector({
        supportedChainIds: [networkId]
      })
    },
    ledger: {
      name: "Ledger",
      connector: new LedgerConnector({
        chainId: networkId,
        url: rpcUrl,
        pollingInterval,
        requestTimeoutMs: pollingInterval
      })
    }
  };
}