import {InjectedConnector} from '@web3-react/injected-connector'
import {LedgerConnector} from '@web3-react/ledger-connector'
import {EthereumConfig} from "../../config";
import {AbstractConnector} from "@web3-react/abstract-connector";

const fullChainIdToNetworkName = {
  1: "Mainnet",
  2: "Expanse",
  3: "Ropsten",
  4: "Rinkeby",
  5: "Görli",
  42: "Kovan"
}

export type ConnectorsList = Record<string, {connector: AbstractConnector, name: string}>;

function getUrl(chainRpcUrls: Record<number, string>, chainId: number): string {
  if (chainRpcUrls[chainId] == null) throw new Error(`Ethereum Rpc Url for chain ${chainId} not found`);
  return chainRpcUrls[chainId];
}

export default function connectorsFactory(config: EthereumConfig) {
  const supportedChainIds: number[] = Object.keys(config.chainRpcUrls).map(e => parseInt(e));
  const connectors: ConnectorsList = {
    injected: {
      name: "Browser Extension",
      connector: new InjectedConnector({
        supportedChainIds: supportedChainIds
      })
    },
    ledger: {
      name: "Ledger",
      connector: new LedgerConnector({
        chainId: config.mainnetChainId,
        url: getUrl(config.chainRpcUrls, config.mainnetChainId),
        pollingInterval: config.pollingInterval,
        requestTimeoutMs: config.pollingInterval
      })
    }
  };

  const chainIdToNetworkName: Record<number, string> = Object.fromEntries(
    Object.entries(fullChainIdToNetworkName)
      .map<[number, string]>(([key, value]) => [parseInt(key), value])
      .filter(([key, _]) => supportedChainIds.includes(key))
  );

  return {
    connectors,
    supportedChainIds,
    chainIdToNetworkName
  }
}