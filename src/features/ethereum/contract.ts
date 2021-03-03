import {Web3Provider} from '@ethersproject/providers';
import {ethers} from "ethers";
import ERC20_ABI from "./erc20Abi";
import CUSTODIAN_ABI from "./custodianContractAbi";

export type TezosAddress = string;
export type EthereumAddress = string;

export class EthereumWrapApi {
  constructor(erc20Contract: ethers.Contract, custodianContract: ethers.Contract, ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress) {
    this.erc20Contract = erc20Contract;
    this.custodianContract = custodianContract;
    this.ethAccountAddress = ethAccountAddress;
    this.tzAccountAddress = tzAccountAddress;
  }

  async balanceOf(): Promise<ethers.BigNumber> {
    return this.erc20Contract.balanceOf(this.ethAccountAddress);
  }

  async allowanceOf(): Promise<ethers.BigNumber> {
    return this.erc20Contract.allowance(this.ethAccountAddress, this.benderContractAddress());
  }

  async approve(amount: ethers.BigNumber) {
    return this.erc20Contract.approve(this.benderContractAddress(), amount);
  }

  async wrap(amount: ethers.BigNumber) {
    return this.custodianContract.wrapERC20(this.erc20ContractAddress(), amount, this.tzAccountAddress, {
      gasLimit: 60000
    });
  }

  private benderContractAddress() {
    return this.custodianContract.address;
  }

  private erc20ContractAddress() {
    return this.erc20Contract.address;
  }

  private readonly erc20Contract: ethers.Contract;
  private readonly custodianContract: ethers.Contract;
  private readonly ethAccountAddress: EthereumAddress;
  private readonly tzAccountAddress: TezosAddress;
}

export class EthereumWrapApiFactory {

  constructor(benderContract: ethers.Contract, ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress, provider: Web3Provider) {
    this.ethAccountAddress = ethAccountAddress;
    this.tezosAccountAddress = tzAccountAddress;
    this.benderContract = benderContract;
    this.provider = provider;
  }

  public forErc20(erc20ContractAddress: EthereumAddress): EthereumWrapApi{
    return new EthereumWrapApi(
      new ethers.Contract(erc20ContractAddress, new ethers.utils.Interface(ERC20_ABI), this.provider.getSigner()),
      this.benderContract,
      this.ethAccountAddress,
      this.tezosAccountAddress
    );
  }

  private readonly provider: Web3Provider;
  private readonly benderContract: ethers.Contract;
  private readonly ethAccountAddress: EthereumAddress;
  private readonly tezosAccountAddress: TezosAddress;
}

export class EthereumWrapApiBuilder {

  constructor(provider: Web3Provider) {
    this.provider = provider;
  }

  public static withProvider(provider: Web3Provider): EthereumWrapApiBuilder {
    return new EthereumWrapApiBuilder(provider);
  }

  public forAccount(ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress): EthereumWrapApiBuilder {
    this.ethAccountAddress = ethAccountAddress;
    this.tzAccountAddress = tzAccountAddress;
    return this
  }

  public forCustodianContract(contractAddress: EthereumAddress): EthereumWrapApiBuilder {
    this.custodianContractAddress = contractAddress;
    return this;
  }

  public createFactory() {
    if(this.provider === undefined || this.ethAccountAddress === undefined || this.custodianContractAddress === undefined || this.tzAccountAddress === undefined) {
      throw new Error("Missing context for Ethereum Wrap Api initialization")
    }

    return new EthereumWrapApiFactory(
      new ethers.Contract(this.custodianContractAddress, new ethers.utils.Interface(CUSTODIAN_ABI), this.provider.getSigner()),
      this.ethAccountAddress,
      this.tzAccountAddress,
      this.provider
    )
  }

  private readonly provider: Web3Provider;
  private custodianContractAddress: undefined | EthereumAddress;
  private ethAccountAddress: undefined | EthereumAddress;
  private tzAccountAddress: undefined | TezosAddress;
}