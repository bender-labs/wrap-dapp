import {OpKind, TezosToolkit, WalletParamsWithKind} from '@taquito/taquito';
import {tzip16} from '@taquito/tzip16';
import BigNumber from 'bignumber.js';
import {IndexerContractBalance} from "../../indexer/indexerApi";
import {FarmConfig} from "../../../config";
import {NewStake} from "../stake_all/hook/useStakeAll";

export interface FarmConfigWithClaimBalances extends FarmConfig {
    earned: BigNumber;
}

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

    public async stakeAll(newStakes: NewStake[], account: string): Promise<string> {

        const operators = await Promise.all(newStakes.map(async (stake): Promise<WalletParamsWithKind> => {
            const farmStakeContract = await this.library.contract.at(stake.farmStakedToken);

            const addOperator = farmStakeContract.methods
                .update_operators([
                    {
                        add_operator: {
                            owner: account,
                            operator: stake.contract,
                            token_id: 0,
                        },
                    }
                ]);

            return {
                kind: OpKind.TRANSACTION,
                ...addOperator.toTransferParams()
            }
        }));

        const stakes = await Promise.all(newStakes.map(async (stake): Promise<WalletParamsWithKind> => {
            const farmContract = await this.library.contract.at(stake.contract);

            return {
                kind: OpKind.TRANSACTION,
                ...farmContract.methods.stake(new BigNumber(stake.amount).shiftedBy(stake.stakeDecimals).toString(10)).toTransferParams()
            };
        }));

        const opg = await this.library.wallet.batch()
            .with(operators)
            .with(stakes)
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

        return {totalSupply, staked, reward};
    }

    public async claim(farmContractAddress: string): Promise<string> {
        const farmContract = await this.library.wallet.at(farmContractAddress);
        const opg = await farmContract.methods.claim({}).send();
        await opg.receipt();
        return opg.opHash;
    }

    public async claimAll(claimBalances: FarmConfigWithClaimBalances[]): Promise<string> {
        const claims = await Promise.all(claimBalances.filter((claim) => {
            return new BigNumber(claim.earned).gt(0);
        }).map(async (claim): Promise<WalletParamsWithKind> => {
            const farmContract = await this.library.contract.at(claim.farmContractAddress);

            return {
                kind: OpKind.TRANSACTION,
                ...farmContract.methods.claim({}).toTransferParams()
            };
        }));

        const opg = await this.library.wallet.batch().with(claims).send();
        await opg.receipt();
        return opg.opHash;
    }

    public async unstakeAll(stakingBalances: IndexerContractBalance[]): Promise<string> {
        const unstakes = await Promise.all(stakingBalances.filter((stake) => {
            return new BigNumber(stake.balance).gt(0);
        }).map(async (stake): Promise<WalletParamsWithKind> => {
            const farmContract = await this.library.contract.at(stake.contract);

            return {
                kind: OpKind.TRANSACTION,
                ...farmContract.methods.withdraw(stake.balance).toTransferParams()
            };
        }));

        const opg = await this.library.wallet.batch().with(unstakes).send();
        await opg.receipt();
        return opg.opHash;
    }

    public async claimBalances(farms: FarmConfig[], owner: string): Promise<FarmConfigWithClaimBalances[]> {
        return await Promise.all(farms.map(async (farm): Promise<FarmConfigWithClaimBalances> => {
            const farmContract = await this.library.contract.at(
                farm.farmContractAddress,
                tzip16
            );
            const views = await farmContract.tzip16().metadataViews();
            const earned = await views.get_earned().executeView(owner);
            return Object.assign({}, farm, {earned: earned});
        }));
    }
}
