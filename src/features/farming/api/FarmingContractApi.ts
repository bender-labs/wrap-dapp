import {TezosToolkit} from '@taquito/taquito';
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
        const stakedTokenContract = await this.library.contract.at(stakedTokenContractAddress);
        const addOperator = stakedTokenContract.methods
            .update_operators([
                {
                    add_operator: {
                        owner: account,
                        operator: farmContractAddress,
                        token_id: 0,
                    }
                }
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

    private async getStorage(
        farmingContract: string
    ): Promise<Record<string, any>> {
        const fContract = await this.library.contract.at(farmingContract);
        return (await fContract.storage()) as Record<string, any>;
    }

    public async totalSupply(farmingContract: string) {
        const storage = await this.getStorage(farmingContract);
        return new BigNumber(storage['farmLpTokenBalance'] as number);
    }

    private static async _balanceOf(
        storage: Record<string, any>,
        owner: string
    ): Promise<BigNumber> {
        try {
            const delegator = await storage['delegators'].get(owner);
            return delegator['lpTokenBalance'] as BigNumber;
        } catch {
            return new BigNumber(0);
        }
    }

    private async updatePool(storage: Record<string, any>) {
        const lastBlockUpdate = storage['farm']['lastBlockUpdate'] as BigNumber;
        const {level: currentLevel} = await this.library.rpc.getBlockHeader();
        const multiplier = new BigNumber(currentLevel).minus(lastBlockUpdate);

        const outstandingReward = multiplier.multipliedBy(
            storage['farm']['plannedRewards']['rewardPerBlock'] as BigNumber
        );

        const claimedRewards = (storage['farm']['claimedRewards'][
            'paid'
            ] as BigNumber).plus(storage['farm']['claimedRewards']['unpaid']);
        const totalRewards = outstandingReward.plus(claimedRewards);
        const plannedRewards = (storage['farm']['plannedRewards'][
            'rewardPerBlock'
            ] as BigNumber).multipliedBy(
            storage['farm']['plannedRewards']['totalBlocks'] as BigNumber
        );
        const totalRewardsExhausted = totalRewards.isGreaterThan(plannedRewards);

        const reward = totalRewardsExhausted
            ? plannedRewards.minus(claimedRewards)
            : outstandingReward;

        return (storage['farm']['accumulatedRewardPerShare'] as BigNumber).plus(
            reward.multipliedBy(1000000).div(storage['farmLpTokenBalance'])
        );
    }

    private async delegatorReward(storage: Record<string, any>, owner: string) {
        const delegatorRecord = await storage['delegators'].get(owner);
        if (!delegatorRecord) {
            return new BigNumber(0);
        }
        const accRewardPerShareStart = delegatorRecord[
            'accumulatedRewardPerShareStart'
            ] as BigNumber;
        const accRewardPerShareEnd = await this.updatePool(storage);
        const accumulatedRewardPerShare = accRewardPerShareEnd.minus(
            accRewardPerShareStart
        );
        const delegatorReward = accumulatedRewardPerShare.multipliedBy(
            delegatorRecord['lpTokenBalance']
        );
        // remove precision
        return delegatorReward.div(1000000).integerValue();
    }

    public async extractBalances(
        farmContractAddress: string,
        owner: string
    ): Promise<{ totalSupply: BigNumber; staked: BigNumber; reward: BigNumber }> {
        // const storage = await this.getStorage(farmingContract);
        // const totalSupply = new BigNumber(storage['farmLpTokenBalance'] as number);
        // const staked = await FarmingContractApi._balanceOf(storage, owner);
        // const reward = await this.delegatorReward(storage, owner);

        //todo : something is wrong here => cors error while fetching metadata json
        // const farmContract = await this.library.contract.at(farmContractAddress, tzip16);
        // const views = await farmContract.tzip16().metadataViews();

        const totalSupply = new BigNumber(0);
        const staked = new BigNumber(0);
        const reward = new BigNumber(0);

        return {totalSupply, staked, reward};
    }

    public async claim(farmContractAddress: string): Promise<string> {
        const farmContract = await this.library.wallet.at(farmContractAddress);
        const opg = await farmContract.methods.claim({}).send();
        await opg.receipt();
        return opg.opHash;
    }
}
