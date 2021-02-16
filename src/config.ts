import {TokenMetadata} from "./features/swap/token";
import {NetworkType} from "@airgap/beacon-sdk";
import custodianContractAbi from "./features/ethereum/custodianContractAbi";

export interface Config {
  environmentName: string,
  ethereum: {
    rpcUrl: string,
    networkId: number,
    networkName: string,
    custodianContractAddress: string,
    custodianContractAbi: Array<object>,
  },
  tezos: {
    rpcUrl: string,
    networkId: NetworkType,
    networkName: string,
  },
  tokens: Record<string, TokenMetadata>
}

export type EthereumConfig = Config["ethereum"];
export type TezosConfig = Config["tezos"];

export enum Environment {
  TESTNET = "TESTNET",
  MAINNET = "MAINNET"
}

export const config: Record<Environment, Config> = {
  [Environment.TESTNET]: {
    environmentName: "Testnet",
    ethereum: {
      rpcUrl: process.env.REACT_APP_ETH_RPC_TESTNET || "",
      networkId: 4,
      networkName: "Rinkeby",
      custodianContractAddress: "0x352488cAaDf763Acaa41fB05E4b5B3a45647C8D5",
      custodianContractAbi: custodianContractAbi
    },
    tezos: {
      rpcUrl: process.env.REACT_APP_TZ_RPC_TESTNET || "",
      networkId: NetworkType.DELPHINET,
      networkName: "Delphi",
    },
    tokens: {
      "FAU": {
        name: "Faucet Token",
        type: "ERC20",
        symbol: "FAU",
        decimals: 18,
        ethContractAddress: "0xFab46E002BbF0b4509813474841E0716E6730136",
        tzWrappingContract: "OOOO"
      }
    }
  },
  [Environment.MAINNET]: {
    environmentName: "Mainnet"
  } as Config //@todo: provide correct config
}