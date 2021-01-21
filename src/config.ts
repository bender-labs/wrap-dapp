type tokenMetadata = Record<string, {
  name: string,
  address: string
}>

export interface EthereumConfig {
  pollingInterval: number;
  chainRpcUrls: Record<number, string>;
  mainnetChainId: number;
  tokens: Record<number, tokenMetadata>;
  benderContracts: Record<number, string>;
}

export interface EthereumConfigForCurrentChain {
  chainRpcUrl: string;
  pollingInterval: number;
  chainId: number;
  tokens: tokenMetadata;
  benderContract: string
}

export const ethereumConfigForCurrentChain = ({
                                                chainRpcUrls,
                                                pollingInterval,
                                                tokens,
                                                benderContracts
                                              }: EthereumConfig) => (chainId: number): EthereumConfigForCurrentChain => ({
  chainRpcUrl: chainRpcUrls[chainId],
  pollingInterval,
  chainId,
  tokens: tokens[chainId],
  benderContract: benderContracts[chainId],
})

export const ethereumConfig: EthereumConfig = {
  chainRpcUrls: {
    1: process.env.REACT_APP_ETH_RPC_1 || "",
    4: process.env.REACT_APP_ETH_RPC_4 || ""
  },
  pollingInterval: parseInt(process.env.REACT_APP_ETH_POLLING_INTERVAL || "12000"),
  mainnetChainId: 1,
  benderContracts: {
    1: "",
    4: "0xc7ECdf6694eE77B696b114CAEDd4124aAeF644ba"
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