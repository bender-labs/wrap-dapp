import {TokenMetadata} from "./features/swap/token";

type tokenConfig = Record<string, TokenMetadata>

export interface EthereumConfig {
  pollingInterval: number;
  chainRpcUrls: Record<number, string>;
  mainnetChainId: number;
  tokens: Record<number, tokenConfig>;
  benderContractAddress: Record<number, string>;
}

export interface EthereumConfigForCurrentChain {
  chainRpcUrl: string;
  pollingInterval: number;
  chainId: number;
  tokens: tokenConfig;
  benderContractAddress: string
}

export const ethereumConfigForCurrentChain = ({
                                                chainRpcUrls,
                                                pollingInterval,
                                                tokens,
                                                benderContractAddress
                                              }: EthereumConfig) => (chainId: number): EthereumConfigForCurrentChain => ({
  chainRpcUrl: chainRpcUrls[chainId],
  pollingInterval,
  chainId,
  tokens: tokens[chainId],
  benderContractAddress: benderContractAddress[chainId],
})

export const ethereumConfig: EthereumConfig = {
  chainRpcUrls: {
    1: process.env.REACT_APP_ETH_RPC_1 || "",
    4: process.env.REACT_APP_ETH_RPC_4 || ""
  },
  pollingInterval: parseInt(process.env.REACT_APP_ETH_POLLING_INTERVAL || "12000"),
  mainnetChainId: 1,
  benderContractAddress: {
    1: "",
    4: "0x6e3d2fF2C4727B9E7F50D9604D7D661de2Ac2c46"
  },
  tokens: {
    1: {},
    4: {
      'FAU': {
        name: "Token Faucet",
        decimals: 18,
        ethContractAddress: "0xFab46E002BbF0b4509813474841E0716E6730136"
      }
    }
  }
}