import {BalancesState} from "../../features/farming/balances-reducer";
import React, {useEffect} from "react";
import {Action} from "../../features/types";
import BigNumber from "bignumber.js";
import {FarmConfig} from "../../config";
import {useConfig} from "../../runtime/config/ConfigContext";
import useTokenBalance from "../../features/token/hook/useTokenBalance";
import useBalances from "../../features/farming/useBalances";

export interface FarmAllProps {
    balances: BalancesState,
    balanceDispatch: React.Dispatch<Action>,
    balance: BigNumber,
    loading: boolean,
    refresh: () => Promise<void>,
    farms: FarmConfig[],
}

function WithBalancesScreen(Comp: React.FunctionComponent<FarmAllProps>) {
    const {balances, balanceDispatch} = useBalances();
    const {farms} = useConfig();
    const {
        balance,
        loading,
        refresh
    } = useTokenBalance(farms[0].farmStakedToken.contractAddress, farms[0].farmStakedToken.tokenId);

    useEffect(() => {
        if (!balances.isDirty && balances.balances.length > 0) {
            refresh();
        }
    }, [balances, refresh]);

    return () => (
        <Comp balances={balances} balanceDispatch={balanceDispatch} balance={balance} loading={loading}
              refresh={refresh} farms={farms}/>
    );
}

export default WithBalancesScreen;