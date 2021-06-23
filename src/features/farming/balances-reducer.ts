import {Action, Dispatch, Store} from "../types";
import IndexerApi, {IndexerContractBalance} from "../indexer/indexerApi";
import {isType} from 'typescript-fsa';
import {
    changeStakingBalances,
    fetchStakingBalances,
    fetchTotalStaked,
    stakingBalancesReceived,
    totalStakedReceived
} from "./balance-actions";

export interface StakeUpdate {
    contract: string;
    maxTotalStakedLevelProcessed: number;
    farmTotalStaked: string;
}

export interface ContractBalance {
    contract: string;
    balance?: string;
    maxLevelProcessed?: number;
    totalStaked?: string;
    maxTotalStakedLevelProcessed?: number;
}

export type BalancesState = {
    balances: ContractBalance[]
};

const computeNewStakingBalances = (balances: ContractBalance[], indexerStakingBalances: IndexerContractBalance[]): ContractBalance[] | null => {
    let shouldUpdate = false;

    const balancesToKeep = indexerStakingBalances.map((currentIndexerStakingBalance) => {
        const existingBalance = balances.find((balance) => {
            return balance.contract === currentIndexerStakingBalance.contract;
        });

        if (existingBalance) {
            if (!existingBalance.maxLevelProcessed || existingBalance.maxLevelProcessed < currentIndexerStakingBalance.maxLevelProcessed) {
                shouldUpdate = true;
                return {
                    ...existingBalance,
                    balance: currentIndexerStakingBalance.balance,
                    maxLevelProcessed: currentIndexerStakingBalance.maxLevelProcessed,
                };
            } else {
                return existingBalance;
            }
        } else {
            shouldUpdate = true;
            return {
                contract: currentIndexerStakingBalance.contract,
                balance: currentIndexerStakingBalance.balance,
                maxLevelProcessed: currentIndexerStakingBalance.maxLevelProcessed
            };
        }
    });

    return shouldUpdate ? balancesToKeep : null;
};

const computeNewTotalStakedBalances = (balances: ContractBalance[], farms: StakeUpdate[]): ContractBalance[] | null => {
    let shouldUpdate = false;

    const balancesToKeep = farms?.map((farm) => {
        const existingBalance = balances.find((balance) => {
            return balance.contract === farm.contract;
        });

        if (existingBalance) {
            if (!existingBalance.maxTotalStakedLevelProcessed || existingBalance.maxTotalStakedLevelProcessed < farm.maxTotalStakedLevelProcessed) {
                shouldUpdate = true;
                return {
                    ...existingBalance,
                    maxTotalStakedLevelProcessed: farm.maxTotalStakedLevelProcessed,
                    totalStaked: farm.farmTotalStaked
                };
            } else {
                return existingBalance;
            }
        } else {
            shouldUpdate = true;
            return {
                contract: farm.contract,
                maxTotalStakedLevelProcessed: farm.maxTotalStakedLevelProcessed,
                totalStaked: farm.farmTotalStaked
            }
        }
    });

    return shouldUpdate ? balancesToKeep : null;
};

export const reducer = (state: BalancesState, action: Action): BalancesState => {
    if (isType(action, stakingBalancesReceived)) {
        const newBalances = computeNewStakingBalances(state.balances, action.payload.balances);
        return newBalances ? {...state, balances: newBalances} : state;
    }
    if (isType(action, changeStakingBalances)) {
        return {...state, balances: action.payload.balances};
    }
    if (isType(action, totalStakedReceived)) {
        const newBalances = computeNewTotalStakedBalances(state.balances, action.payload.farms);
        return newBalances ? {...state, balances: newBalances} : state;
    }
    return state;
};

export const sideEffectReducer = (indexerApi: IndexerApi) => (
    {getState, dispatch}: Store<BalancesState>,
    action: Action
) => async (next: Dispatch) => {
    if (isType(action, fetchStakingBalances)) {
        const {tezosAccount} = action.payload;
        const stakingBalances = await indexerApi.fetchCurrentUserFarmingConfiguration(tezosAccount);
        dispatch(stakingBalancesReceived({balances: stakingBalances}));
        return;
    }
    if (isType(action, fetchTotalStaked)) {
        const farmingConfiguration = await indexerApi.fetchFarmingConfiguration();
        dispatch(totalStakedReceived({
            farms: farmingConfiguration.contracts.map((payload) => {
                return {
                    contract: payload.contract,
                    maxTotalStakedLevelProcessed: payload.maxLevelProcessed,
                    farmTotalStaked: payload.totalStaked
                };
            })
        }));
    }
    next(action);
};