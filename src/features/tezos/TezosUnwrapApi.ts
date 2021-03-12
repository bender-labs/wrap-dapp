import {Web3Provider} from '@ethersproject/providers';
import {ethers} from "ethers";
import ERC20_ABI from "../ethereum/erc20Abi";
import CUSTODIAN_ABI from "../ethereum/custodianContractAbi";
import {TezosToolkit} from "@taquito/taquito";
import {tzip16} from "@taquito/tzip16";

export type TezosAddress = string;
export type EthereumAddress = string;

export class TezosUnwrapApi {
  constructor(erc20Contract: ethers.Contract, tezosWrappingContract: string, tezosTokenId: number, custodianContract: ethers.Contract, benderContract: string, ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress, tzToolkit: TezosToolkit) {
    this.erc20Contract = erc20Contract;
    this.tezosWrappingContract = tezosWrappingContract;
    this.tezosTokenId = tezosTokenId;
    this.custodianContract = custodianContract;
    this.ethAccountAddress = ethAccountAddress;
    this.tzAccountAddress = tzAccountAddress;
    this.tzToolkit = tzToolkit;
  }

  async balanceOf(): Promise<ethers.BigNumber> {
    const contract = await this.tzToolkit.contract
        .at(this.tezosWrappingContract, tzip16);
    const views = await contract.tzip16().metadataViews();
    console.log(views);
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
  private readonly tezosWrappingContract: string;
  private readonly tezosTokenId: number;
  private readonly tzToolkit: TezosToolkit;
}

export class TezosUnwrapApiFactory {

  constructor(benderContract: ethers.Contract, quorumContract: string, ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress, provider: Web3Provider, tzToolkit: TezosToolkit) {
    this.ethAccountAddress = ethAccountAddress;
    this.tezosAccountAddress = tzAccountAddress;
    this.benderContract = benderContract;
    this.quorumContract = quorumContract;
    this.provider = provider;
    this.tzToolkit = tzToolkit;
  }

  public forFa20(erc20ContractAddress: EthereumAddress, tezosWrappingContract: string, tezosTokenId: number): TezosUnwrapApi{
    return new TezosUnwrapApi(
        new ethers.Contract(erc20ContractAddress, new ethers.utils.Interface(ERC20_ABI), this.provider.getSigner()),
        tezosWrappingContract,
        tezosTokenId,
        this.benderContract,
        this.quorumContract,
        this.ethAccountAddress,
        this.tezosAccountAddress,
        this.tzToolkit
    );
  }

  private readonly provider: Web3Provider;
  private readonly tzToolkit: TezosToolkit;
  private readonly benderContract: ethers.Contract;
  private readonly quorumContract: string;
  private readonly ethAccountAddress: EthereumAddress;
  private readonly tezosAccountAddress: TezosAddress;
}

export class TezosUnwrapApiBuilder {

  constructor(provider: Web3Provider, tzLibrary: TezosToolkit) {
    this.provider = provider;
    this.tzLibrary = tzLibrary;
  }

  public static withProvider(provider: Web3Provider, tzLibrary: TezosToolkit): TezosUnwrapApiBuilder {
    return new TezosUnwrapApiBuilder(provider, tzLibrary);
  }

  public forAccount(ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress): TezosUnwrapApiBuilder {
    this.ethAccountAddress = ethAccountAddress;
    this.tzAccountAddress = tzAccountAddress;
    return this
  }

  public forCustodianContract(contractAddress: EthereumAddress, quorumContractAddress: string): TezosUnwrapApiBuilder {
    this.custodianContractAddress = contractAddress;
    this.quorumContractAddress = quorumContractAddress;
    return this;
  }

  public createFactory() {
    if(this.provider === undefined
        || this.ethAccountAddress === undefined
        || this.custodianContractAddress === undefined
        || this.tzAccountAddress === undefined
        || this.quorumContractAddress === undefined
        || this.tzLibrary === undefined
    ) {
      throw new Error("Missing context for Tezos Wrap Api initialization")
    }

    return new TezosUnwrapApiFactory(
      new ethers.Contract(this.custodianContractAddress, new ethers.utils.Interface(CUSTODIAN_ABI), this.provider.getSigner()),
      this.quorumContractAddress,
      this.ethAccountAddress,
      this.tzAccountAddress,
      this.provider,
      this.tzLibrary
    )
  }

  private readonly provider: Web3Provider;
  private readonly tzLibrary: TezosToolkit;
  private custodianContractAddress: undefined | EthereumAddress;
  private quorumContractAddress: undefined | string;
  private ethAccountAddress: undefined | EthereumAddress;
  private tzAccountAddress: undefined | TezosAddress;
}