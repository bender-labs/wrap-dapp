import axios, { AxiosInstance } from 'axios';
import { EthereumAddress, TezosAddress } from '../ethereum/EthereumWrapApi';

export interface IndexerTokenPayload {
  id: string;
  source: string;
  destination: string;
  token: string;
  transactionHash?: string;
  operationHash?: string;
  signatures: Record<string, string>;
  confirmations: number;
  confirmationsThreshold: number;
  amount?: string;
  tokenId: string;
  status: 'asked' | 'finalized';
}

export interface IndexerWrapPayload {
  result: Array<IndexerTokenPayload>;
}

export interface IndexerUnwrapPayload {
  result: Array<IndexerTokenPayload>;
}

export interface IndexerConfigPayload {
  ethereumNetwork: string;
  ethereumNetworkId: string;
  tezosNetwork: string;
  ethereumWrapContract: string;
  tezosMinterContract: string;
  tezosQuorumContract: string;
  wrapRequiredSignatures: number;
  unwrapRequiredSignatures: number;
  tokens: Array<{
    type: 'ERC20' | 'ERC721';
    ethereumSymbol: string;
    ethereumName: string;
    ethereumContractAddress: string;
    decimals: number;
    tezosWrappingContract: string;
    tezosTokenId: string | null;
    tezosSymbol: string;
    tezosName: string;
    thumbnailUri: string | null;
  }>;
  fees: {
    erc20WrappingFees: number;
    erc20UnwrappingFees: number;
    erc721WrappingFees: number;
    erc721UnwrappingFees: number;
  };
}

export default class IndexerApi {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL, timeout: 3000 });
  }

  public fetchConfig(_: void): Promise<IndexerConfigPayload> {
    return this.client.get('/configuration').then(({ data }) => data);
  }

  public fetchPendingWrap(
    ethereumAddress?: EthereumAddress,
    tezosAddress?: TezosAddress
  ): Promise<IndexerWrapPayload> {
    return this.client
      .get('/wraps', {
        params: { ethereumAddress, tezosAddress, status: 'asked' },
      })
      .then(({ data }) => data);
  }

  public fetchWrapsByHash(hash: string): Promise<IndexerWrapPayload> {
    return this.client
      .get('/wraps', {
        params: { hash },
      })
      .then(({ data }) => data);
  }

  public fetchPendingUnwrap(
    ethereumAddress?: EthereumAddress,
    tezosAddress?: TezosAddress
  ): Promise<IndexerUnwrapPayload> {
    return this.client
      .get('/unwraps', {
        params: { ethereumAddress, tezosAddress, status: 'asked' },
      })
      .then(({ data }) => data);
  }
}
