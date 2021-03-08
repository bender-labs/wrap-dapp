import {ethers} from "ethers";
import axios from "axios";

interface SignerEventPayload {
  parameters: {
    amount: ethers.BigNumber
    blockHash: string,
    erc20: string,
    logIndex: number,
    owner: string
  },
  quorum: {
    minterContract: string,
    quorumContract: string
  },
  signatures: Array<{
    signerId: string,
    signature: string
  }>,
  transactionHash: string
}

interface IndexerConfigPayload {
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

  return ({
    fetchConfig
  })
}