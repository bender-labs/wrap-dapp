export interface EthereumConfig {
  pollingInterval: number;
  chainRpcUrls: Record<number, string>;
  mainnetChainId: number;
}

export const ethereumConfig: EthereumConfig = {
  chainRpcUrls: {
    1: process.env.REACT_APP_ETH_RPC_1 || "",
    4: process.env.REACT_APP_ETH_RPC_4 || ""
  },
  pollingInterval: parseInt(process.env.REACT_APP_ETH_POLLING_INTERVAL || "12000"),
  mainnetChainId: 1
}