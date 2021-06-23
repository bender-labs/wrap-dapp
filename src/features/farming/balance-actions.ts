import actionCreatorFactory from 'typescript-fsa';
import {ContractBalance, StakeUpdate} from "./balances-reducer";
import {IndexerContractBalance} from "../indexer/indexerApi";

const actionCreator = actionCreatorFactory();

export const fetchStakingBalances = actionCreator<{
    tezosAccount: string
}>('FETCH_STAKING_BALANCES');

export const stakingBalancesReceived = actionCreator<{
    balances: IndexerContractBalance[]
}>('STAKING_BALANCES_RECEIVED');

export const changeStakingBalances = actionCreator<{
    balances: ContractBalance[]
}>('CHANGE_STAKING_BALANCES');

export const fetchTotalStaked = actionCreator<{}>('FETCH_FARM_BALANCES');

export const totalStakedReceived = actionCreator<{
    farms: StakeUpdate[]
}>('FARM_BALANCES_RECEIVED');