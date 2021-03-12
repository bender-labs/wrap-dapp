import {TezosToolkit} from "@taquito/taquito";
import {tzip16} from "@taquito/tzip16";
import BigNumber from "bignumber.js";

export type TezosAddress = string;
export type EthereumAddress = string;

export class TezosUnwrapApi {
  constructor(tezosWrappingContract: string, tezosTokenId: number, quorumContract: string, ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress, tzToolkit: TezosToolkit) {
    this.tezosWrappingContract = tezosWrappingContract;
    this.tezosTokenId = tezosTokenId;
    this.quorumContract = quorumContract;
    this.ethAccountAddress = ethAccountAddress;
    this.tzAccountAddress = tzAccountAddress;
    this.tzToolkit = tzToolkit;
  }

  async balanceOf(): Promise<BigNumber> {
    const contract = await this.tzToolkit.contract
        .at(this.tezosWrappingContract, tzip16);
    const views = await contract.tzip16().metadataViews();
    return views['get_balance']().executeView(this.tzAccountAddress, this.tezosTokenId);
  }

  async unwrap(amount: BigNumber) {
    await Promise.resolve();
    /*return this.custodianContract.wrapERC20(this.erc20ContractAddress(), amount, this.tzAccountAddress, {
      gasLimit: 60000
    });*/
  }

  private readonly ethAccountAddress: EthereumAddress;
  private readonly tzAccountAddress: TezosAddress;
  private readonly quorumContract: string;
  private readonly tezosWrappingContract: string;
  private readonly tezosTokenId: number;
  private readonly tzToolkit: TezosToolkit;
}

export class TezosUnwrapApiFactory {

  constructor(quorumContract: string, ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress, tzToolkit: TezosToolkit) {
    this.ethAccountAddress = ethAccountAddress;
    this.tezosAccountAddress = tzAccountAddress;
    this.quorumContract = quorumContract;
    this.tzToolkit = tzToolkit;
  }

  public forFa20(erc20ContractAddress: EthereumAddress, tezosWrappingContract: string, tezosTokenId: number): TezosUnwrapApi{
    return new TezosUnwrapApi(
        tezosWrappingContract,
        tezosTokenId,
        this.quorumContract,
        this.ethAccountAddress,
        this.tezosAccountAddress,
        this.tzToolkit
    );
  }

  private readonly tzToolkit: TezosToolkit;
  private readonly quorumContract: string;
  private readonly ethAccountAddress: EthereumAddress;
  private readonly tezosAccountAddress: TezosAddress;
}

export class TezosUnwrapApiBuilder {

  constructor(tzLibrary: TezosToolkit) {
    this.tzLibrary = tzLibrary;
  }

  public static withProvider(tzLibrary: TezosToolkit): TezosUnwrapApiBuilder {
    return new TezosUnwrapApiBuilder(tzLibrary);
  }

  public forAccount(ethAccountAddress: EthereumAddress, tzAccountAddress: TezosAddress): TezosUnwrapApiBuilder {
    this.ethAccountAddress = ethAccountAddress;
    this.tzAccountAddress = tzAccountAddress;
    return this
  }

  public forCustodianContract(quorumContractAddress: string): TezosUnwrapApiBuilder {
    this.quorumContractAddress = quorumContractAddress;
    return this;
  }

  public createFactory() {
    if(this.ethAccountAddress === undefined
        || this.tzAccountAddress === undefined
        || this.quorumContractAddress === undefined
        || this.tzLibrary === undefined
    ) {
      throw new Error("Missing context for Tezos Wrap Api initialization")
    }

    return new TezosUnwrapApiFactory(
      this.quorumContractAddress,
      this.ethAccountAddress,
      this.tzAccountAddress,
      this.tzLibrary
    )
  }

  private readonly tzLibrary: TezosToolkit;
  private quorumContractAddress: undefined | string;
  private ethAccountAddress: undefined | EthereumAddress;
  private tzAccountAddress: undefined | TezosAddress;
}