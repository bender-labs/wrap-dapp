export enum SupportedBlockchain {
  Tezos,
  Ethereum
}

export type ProviderList = Array<{name: string, key: string}>;

export function humanizeSupportedBlockchain(blockchain: SupportedBlockchain): string {
  switch (blockchain) {
    case SupportedBlockchain.Tezos:
      return "Tezos";
    case SupportedBlockchain.Ethereum:
      return "Ethereum";
  }
}