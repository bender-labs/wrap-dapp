import {Web3Provider} from '@ethersproject/providers';
import {ethers} from "ethers";
import ERC20_ABI from "./erc20Abi";

export class EthereumERC20ContractApi {

  constructor(contract: ethers.Contract, benderContractAddress: string, accountAddress: string) {
    this.contract = contract;
    this.benderContractAddress = benderContractAddress;
    this.accountAddress = accountAddress;
  }

  async balanceOf() {
    return this.contract.balanceOf(this.accountAddress);
  }

  async allowance() {
    return this.contract.allowance(this.accountAddress, this.benderContractAddress);
  }

  async approve(amount: ethers.BigNumber) {
    return this.contract.approve(this.benderContractAddress, amount);
  }

  private readonly contract: ethers.Contract;
  private readonly benderContractAddress: string;
  private readonly accountAddress: string;

  static withProvider(provider: Web3Provider) {
    return {
      forContract: (contractAddress: string, benderContractAddress: string, accountAddress: string) =>
        new EthereumERC20ContractApi(
          new ethers.Contract(contractAddress, new ethers.utils.Interface(ERC20_ABI), provider.getSigner()),
          benderContractAddress,
          accountAddress
        )
    }
  }
}

export class CustodianContractApi {

  constructor(contract: ethers.Contract) {
    this._contract = contract;
  }

  async wrap(amount: ethers.BigNumber, erc20ContractAddress: string, destinationTezosAddress: string = "tz1exrEuATYhFmVSXhkCkkFzY72T75hpsthj") {
    let overrides = {
      gasLimit: 60000
    };
    return this._contract.wrapERC20(erc20ContractAddress, amount, destinationTezosAddress, overrides);
  }

  private _contract: ethers.Contract;

  static withProvider(provider: Web3Provider) {
    return {
      forContract: (contractAddress: string, abi: Array<object>) => new CustodianContractApi(
        new ethers.Contract(contractAddress, new ethers.utils.Interface(abi), provider.getSigner())
      )
    }
  }
}