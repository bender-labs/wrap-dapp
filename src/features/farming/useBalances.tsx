import {Reducer, useEffect, useReducer} from "react";
import {useWalletContext} from "../../runtime/wallet/WalletContext";
import {useConfig, useIndexerApi} from "../../runtime/config/ConfigContext";
import {Action, connectStore, createStore} from "../types";
import {BalancesState, reducer, sideEffectReducer} from "./balances-reducer";
import {fetchStakingBalances, fetchTotalStaked, totalStakedReceived} from "./balance-actions";

export default function useBalances() {
    const walletContext = useWalletContext();
    const {farms} = useConfig();
    const indexerApi = useIndexerApi();
    const initialBalances: BalancesState = {
        balances: []
    };
    const [balances, balanceDispatch] = useReducer<Reducer<BalancesState, Action>, BalancesState>(reducer, initialBalances, () => initialBalances);

    const effectsDispatch = connectStore(
        createStore(balances, balanceDispatch),
        sideEffectReducer(indexerApi)
    );

    useEffect(() => {
        const loadStakingBalances = async () => {
            if (walletContext.tezos.account) {
                effectsDispatch(fetchStakingBalances({tezosAccount: walletContext.tezos.account}));
            }
        };

        const timer = setInterval(() => {
            // noinspection JSIgnoredPromiseFromCall
            loadStakingBalances();
        }, 15000);

        // noinspection JSIgnoredPromiseFromCall
        loadStakingBalances();

        return () => clearInterval(timer);
    }, [walletContext.tezos.account, indexerApi]);

    useEffect(() => {
        if (farms && farms.length > 0) {
            balanceDispatch(totalStakedReceived({
                farms: farms.map((farm) => {
                    return {
                        contract: farm.farmContractAddress,
                        maxTotalStakedLevelProcessed: farm.maxTotalStakedLevelProcessed,
                        farmTotalStaked: farm.farmTotalStaked
                    }
                })
            }));
        }
    }, [farms]);

    useEffect(() => {
        const loadTotalStakedBalances = async () => {
            if (walletContext.tezos.account) {
                effectsDispatch(fetchTotalStaked({}));
            }
        };

        const timer = setInterval(() => {
            // noinspection JSIgnoredPromiseFromCall
            loadTotalStakedBalances();
        }, 15000);

        // noinspection JSIgnoredPromiseFromCall
        loadTotalStakedBalances();

        return () => clearInterval(timer);
    }, [walletContext.tezos.account, indexerApi]);

    return {balances, balanceDispatch};
};