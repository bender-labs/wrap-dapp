import axios, { AxiosInstance } from 'axios';
import { EthereumAddress, TezosAddress } from '../ethereum/EthereumWrapApi';

interface IndexerTokenPayload {
  id: string;
  source: string;
  destination: string;
  token: string;
  transactionHash?: string;
  operationHash?: string;
  signatures: Record<string, string>;
  confirmations: number;
  confirmationsThreshold: number;
}

export interface IndexerERC20Payload extends IndexerTokenPayload {
  amount: string;
}

interface IndexerERC721Payload extends IndexerTokenPayload {
  tokenId: string;
}

export interface IndexerWrapPayload {
  erc20Wraps: Array<IndexerERC20Payload>;
  erc721Wraps: Array<IndexerERC721Payload>;
}

export interface IndexerUnwrapPayload {
  erc20Unwraps: Array<IndexerERC20Payload>;
  erc721Unwraps: Array<IndexerERC721Payload>;
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
      .get('/wraps/pending', { params: { ethereumAddress, tezosAddress } })
      .then(({ data }) => data);
  }

  public fetchPendingUnwrap(
    ethereumAddress?: EthereumAddress,
    tezosAddress?: TezosAddress
  ): Promise<IndexerUnwrapPayload> {
    return this.client
      .get('/unwraps/pending', { params: { ethereumAddress, tezosAddress } })
      .then(({ data }) => data);
  }
}
