import {ethers} from "ethers";

export function formatAmount(symbol: string, balance: ethers.BigNumber, decimals: number) {
  return `${symbol} ${ethers.utils.formatUnits(balance, decimals)}`
}