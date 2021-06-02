import { TezosToolkit } from '@taquito/taquito';
import { tzip16 } from '@taquito/tzip16';
import BigNumber from 'bignumber.js';

export default class FarmingContractApi {
  private library: TezosToolkit;

  constructor(library: TezosToolkit) {
    this.library = library;
  }

  public async stake(
    account: string,
    amount: BigNumber,
    stakedTokenContractAddress: string,
    farmContractAddress: string
  ): Promise<string> {
    const farmContract = await this.library.contract.at(farmContractAddress);
    const stakedTokenContract = await this.library.contract.at(
      stakedTokenContractAddress
    );
    const addOperator = stakedTokenContract.methods
      .update_operators([
        {
          add_operator: {
            owner: account,
            operator: farmContractAddress,
            token_id: 0,
          },
        },
      ])
      .toTransferParams();
    const stake = await farmContract.methods.stake(amount).toTransferParams();
    const opg = await this.library.wallet
      .batch()
      .withTransfer(addOperator)
      .withTransfer(stake)
      .send();
    await opg.receipt();
    return opg.opHash;
  }

  public async unstake(
    amount: BigNumber,
    farmContractAddress: string
  ): Promise<string> {
    const farmContract = await this.library.wallet.at(farmContractAddress);
    const opg = await farmContract.methods.withdraw(amount.toString(10)).send();
    await opg.receipt();
    return opg.opHash;
  }

  public async extractBalances(
    farmContractAddress: string,
    owner: string
  ): Promise<{ totalSupply: BigNumber; staked: BigNumber; reward: BigNumber }> {
    const farmContract = await this.library.contract.at(
      farmContractAddress,
      tzip16
    );

    const views = await farmContract.tzip16().metadataViews();
    const [staked, reward, totalSupply] = await Promise.all([
      views.get_balance().executeView(owner),
      views.get_earned().executeView(owner),
      views.total_supply().executeView(),
    ]);

    return { totalSupply, staked, reward };
  }

  public async claim(farmContractAddress: string): Promise<string> {
    const farmContract = await this.library.wallet.at(farmContractAddress);
    const opg = await farmContract.methods.claim({}).send();
    await opg.receipt();
    return opg.opHash;
  }
}
