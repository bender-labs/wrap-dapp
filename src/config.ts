import {TokenMetadata} from "./features/swap/token";
import {NetworkType} from "@airgap/beacon-sdk";

export interface InitialConfig {
  environmentName: string,
  indexerUrl: string,
  ethereum: {
    rpcUrl: string,
    networkId: number,
    networkName: string
  },
  tezos: {
    rpcUrl: string,
    networkId: NetworkType,
    networkName: string,
  }
}

export interface Config {
  environmentName: string,
  ethereum: {
    rpcUrl: string,
    networkId: number,
    networkName: string,
    custodianContractAddress: string,
  },
  tezos: {
    rpcUrl: string,
    networkId: NetworkType,
    networkName: string,
    minterContractAddress: string,
    quorumContractAddress: string
  },
  wrapSignatureThreshold: number,
  unwrapSignatureThreshold: number,
  tokens: Record<string, TokenMetadata>
}

export type EthereumConfig = Config["ethereum"];
export type TezosConfig = Config["tezos"];

export enum Environment {
  TESTNET = "TESTNET",
  MAINNET = "MAINNET"
}

export enum ConfigStatus {
  UNINITIALIZED,
  LOADING,
  LOADED
}

export const initialConfig: Record<string, InitialConfig> = {
  [Environment.TESTNET]: {
    environmentName: "Testnet",
    indexerUrl: process.env.REACT_APP_INDEXER_TESTNET || "",
    ethereum: {
      rpcUrl: process.env.REACT_APP_ETH_RPC_TESTNET || "",
      networkId: 4,
      networkName: "Rinkeby"
    },
    tezos: {
      rpcUrl: process.env.REACT_APP_TZ_RPC_TESTNET || "",
      networkId: NetworkType.DELPHINET,
      networkName: "Delphi",
    }
  },
  [Environment.MAINNET]: {
    environmentName: "Mainnet"
  } as InitialConfig
}
/*
export const config: Record<Environment, Config> = {
  [Environment.TESTNET]: {
    environmentName: "Testnet",
    ethereum: {
      rpcUrl: process.env.REACT_APP_ETH_RPC_TESTNET || "",
      networkId: 4,
      networkName: "Rinkeby",
      custodianContractAddress: "0x352488cAaDf763Acaa41fB05E4b5B3a45647C8D5",
    },
    tezos: {
      rpcUrl: process.env.REACT_APP_TZ_RPC_TESTNET || "",
      networkId: NetworkType.DELPHINET,
      networkName: "Delphi",
    },
    tokens: {
      "FAU": {
        name: "Faucet Token", //@todo tzName
        type: "ERC20",
        symbol: "FAU",
        decimals: 18,
        ethContractAddress: "0xFab46E002BbF0b4509813474841E0716E6730136",
        tzWrappingContract: "OOOO",
        tzTokenId: 0
      }
    }
  },
  [Environment.MAINNET]: {
    environmentName: "Mainnet"
  } as Config //@todo: provide correct config
}
*/