export interface EthereumConfig {
  pollingInterval: number;
  chainRpcUrls: Record<number, string>;
  mainnetChainId: number;
  tokens: Record<number, Record<string, {
    name: string,
    address: string
  }>>;
  benderCustodianContracts: Record<number, string>;
}

export const ethereumConfig: EthereumConfig = {
  chainRpcUrls: {
    1: process.env.REACT_APP_ETH_RPC_1 || "",
    4: process.env.REACT_APP_ETH_RPC_4 || ""
  },
  pollingInterval: parseInt(process.env.REACT_APP_ETH_POLLING_INTERVAL || "12000"),
  mainnetChainId: 1,
  benderCustodianContracts: {
    1: "",
    4: "0x89b959F572b7fCd4A48f0878F6bee8Db80fC42eE"
  },
  tokens: {
    1: {},
    4: {
      'FAU': {
        name: "Token Faucet",
        address: "0xFab46E002BbF0b4509813474841E0716E6730136"
      }
    }
  }
}