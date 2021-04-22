import { TokenMetadata } from './features/swap/token';
import { NetworkType } from '@airgap/beacon-sdk';

export type Fees = {
  erc20WrappingFees: number;
  erc20UnwrappingFees: number;
  erc721WrappingFees: number;
  erc721UnwrappingFees: number;
};

export interface InitialConfig {
  environmentName: string;
  indexerUrl: string;
  ethereum: {
    rpcUrl: string;
    networkId: number;
    networkName: string;
    formaticApiKey: string;
    portisDAppId: string;
  };
  tezos: {
    rpcUrl: string;
    networkId: NetworkType;
    networkName: string;
  };
}

export interface Config {
  environmentName: string;
  indexerUrl: string;
  ethereum: {
    rpcUrl: string;
    networkId: number;
    networkName: string;
    formaticApiKey: string;
    portisDAppId: string;
    custodianContractAddress: string;
  };
  tezos: {
    rpcUrl: string;
    networkId: NetworkType;
    networkName: string;
    minterContractAddress: string;
    quorumContractAddress: string;
  };
  wrapSignatureThreshold: number;
  unwrapSignatureThreshold: number;
  fungibleTokens: Record<string, TokenMetadata>;
  fees: Fees;
}

export type EthereumConfig = Config['ethereum'];
export type TezosConfig = Config['tezos'];

export enum Environment {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}

export enum ConfigStatus {
  UNINITIALIZED,
  LOADING,
  LOADED,
}

export const initialConfig: InitialConfig = {
  environmentName: process.env.REACT_APP_WRAP_ENVIRONMENT!,
  indexerUrl: process.env.REACT_APP_INDEXER!,
  ethereum: {
    rpcUrl: process.env.REACT_APP_ETH_RPC!,
    networkId: +process.env.REACT_APP_ETH_NETWORK_ID!,
    networkName: process.env.REACT_APP_ETH_NETWORK_NAME!,
    formaticApiKey: process.env.REACT_APP_FORTMATIC_API_KEY!,
    portisDAppId: process.env.REACT_APP_PORTIS_DAPP_ID!,
  },
  tezos: {
    rpcUrl: process.env.REACT_APP_TZ_RPC!,
    networkId: process.env.REACT_APP_TZ_NETWORK_ID! as NetworkType,
    networkName: process.env.REACT_APP_TZ_NETWORK_NAME!,
  },
};
