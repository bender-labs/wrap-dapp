import axios from "axios";
import {EthereumAddress, TezosAddress} from "../ethereum/EthereumWrapApi";

interface IndexerTokenPayload {
  id: string,
  source: string,
  destination: string,
  token: string,
  transactionHash: string,
  signatures: Record<string, string>,
  confirmations: number,
  confirmationsThreshold: number
}

interface IndexerERC20Payload extends IndexerTokenPayload {
  amount: string
}

interface IndexerERC721Payload extends IndexerTokenPayload {
  tokenId: string
}

export interface IndexerWrapPayload {
  erc20Wraps: Array<IndexerERC20Payload>,
  erc721Wraps: Array<IndexerERC721Payload>
}

export interface IndexerUnwrapPayload {
  erc20Unwraps: Array<IndexerERC20Payload>,
  erc721Unwraps: Array<IndexerERC721Payload>
}

export interface IndexerConfigPayload {
  ethereumNetwork: string,
  ethereumNetworkId: string,
  tezosNetwork: string,
  ethereumWrapContract: string,
  tezosMinterContract: string,
  tezosQuorumContract: string,
  wrapRequiredSignatures: number,
  unwrapRequiredSignatures: number,
  tokens: Array<{
    type: "ERC20" | "ERC721",
    ethereumSymbol: string,
    ethereumName: string,
    ethereumContractAddress: string,
    decimals: number,
    tezosWrappingContract: string,
    tezosTokenId: string | null,
    tezosSymbol: string,
    tezosName: string
  }>
}

export default function indexerApi(baseURL: string) {
  const axiosInstance = axios.create({
    baseURL,
    timeout: 1000
  });

  const fetchConfig: (_: void) => Promise<IndexerConfigPayload> = () => axiosInstance.get("configuration").then(({data}) => data);

  const fetchPendingWrap: (ethereumAddress: EthereumAddress, tezosAddress: TezosAddress) => Promise<IndexerWrapPayload> =
    (ethereumAddress, tezosAddress) => axiosInstance.get("wraps", {params: {ethereumAddress, tezosAddress}}).then(({data}) => data);

  const fetchPendingUnwrap: (ethereumAddress: EthereumAddress, tezosAddress: TezosAddress) => Promise<IndexerUnwrapPayload> =
      (ethereumAddress, tezosAddress) => axiosInstance.get("unwraps", {params: {ethereumAddress, tezosAddress}}).then(({data}) => data);

  return ({
    fetchConfig,
    fetchPendingWrap,
    fetchPendingUnwrap
  })
}
