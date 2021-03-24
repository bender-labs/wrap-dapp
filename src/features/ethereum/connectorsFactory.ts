import {InjectedConnector} from '@web3-react/injected-connector'
import {WalletConnectConnector} from '@web3-react/walletconnect-connector';
import {FortmaticConnector} from '@web3-react/fortmatic-connector';
import {PortisConnector} from '@web3-react/portis-connector';
import {EthereumConfig} from "../../config";

declare const window: any;

export default function connectorsFactory({rpcUrl, networkId, formaticApiKey, portisDAppId}: EthereumConfig) {
  const isMetamask = window.ethereum && window.ethereum.isMetaMask;
  return {
    injected: {
      name: isMetamask ? "Metamask" : "Browser Extension",
      connector: new InjectedConnector({
        supportedChainIds: [networkId]
      })
    },
    walletConnect: {
      name: "WalletConnect",
      connector: new WalletConnectConnector({
        rpc: {1: rpcUrl},
        qrcode: true,
        bridge: "https://bridge.walletconnect.org",
        pollingInterval: 15000
      })
    },
    fortmatic: {
      name: "Fortmatic",
      connector: new FortmaticConnector({
        apiKey: formaticApiKey,
        chainId: networkId
      })
    },
    portis: {
      name: "Portis",
      connector: new PortisConnector({
        dAppId: portisDAppId,
        networks: [networkId]
      })
    }
  };
}