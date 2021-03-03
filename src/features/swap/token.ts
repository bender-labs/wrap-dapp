
export type TokenMetadata = {
  name: string,
  type: 'ERC20' | 'ERC721',
  ethContractAddress: string,
  tzWrappingContract: string,
  decimals: number,
  symbol: string,
  tzTokenId: number
}

export type Token = {
  token: string
} & TokenMetadata;

export const EmptyToken: Token = {
  type: 'ERC20',
  symbol: "",
  tzWrappingContract: "",
  token: "",
  name: "",
  ethContractAddress: "",
  decimals: 0,
  tzTokenId: 0
}