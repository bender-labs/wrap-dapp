
export type TokenMetadata = {
  name: string,
  ethContractAddress: string,
  decimals: number
}

export type Token = {
  token: string
} & TokenMetadata;

export const EmptyToken = {
  token: "",
  name: "",
  ethContractAddress: "",
  decimals: 0
}