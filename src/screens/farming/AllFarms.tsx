import React, {useCallback, useEffect} from 'react';
import {Container, Tab, Tabs} from '@material-ui/core';
import {Route, Switch} from 'react-router-dom';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {paths} from "../routes";
import UnstakeAll from "../../features/farming/unstake_all/UnstakeAll";
import ClaimAll from "../../features/farming/claim_all/ClaimAll";
import {useHistory, useRouteMatch} from "react-router";
import StakeAll from "../../features/farming/stake_all/StakeAll";
import useBalances from "../../features/farming/useBalances";
import {Action} from "../../features/types";
import {BalancesState} from "../../features/farming/balances-reducer";
import useTokenBalance from "../../features/token/hook/useTokenBalance";
import BigNumber from "bignumber.js";
import {useConfig} from "../../runtime/config/ConfigContext";
import {FarmConfig} from "../../config";

const useStyles = makeStyles((theme) => createStyles({
    bg: {
        color: 'white',
        marginBottom: '10px',
    },
    tab: {
        textTransform: 'none',
        fontWeight: 900,
    }
}));

export interface FarmAllProps {
    balances: BalancesState,
    balanceDispatch: React.Dispatch<Action>,
    balance: BigNumber,
    loading: boolean,
    refresh: () => Promise<void>,
    farms: FarmConfig[],
}

function WithBalances(balances: BalancesState,
                      balanceDispatch: React.Dispatch<Action>,
                      balance: BigNumber,
                      loading: boolean,
                      refresh: () => Promise<void>,
                      farms: FarmConfig[],
                      Comp: React.FunctionComponent<FarmAllProps>) {
    return () => (
        <Comp balances={balances} balanceDispatch={balanceDispatch} balance={balance} loading={loading}
              refresh={refresh} farms={farms}/>
    );
}

function AllFarms() {
    const {path} = useRouteMatch();
    const classes = useStyles();
    const history = useHistory();
    const {balances, balanceDispatch} = useBalances();
    const {farms} = useConfig();
    const {
        balance,
        loading,
        refresh
    } = useTokenBalance(farms[0].farmStakedToken.contractAddress, farms[0].farmStakedToken.tokenId);

    const onTabChange = useCallback(
        (event: React.ChangeEvent<{}>, newPath: string) => {
            history.push(newPath);
        },
        [history]
    );

    useEffect(() => {
        if (!balances.isDirty && balances.balances.length > 0) {
            refresh();
        }
    }, [balances, refresh]);

    return (
        <Container>
            <Tabs value={path} onChange={onTabChange} className={classes.bg} indicatorColor="primary"
                  variant="fullWidth">
                <Tab label="Stake on all farms" value={paths.ALL_FARMS_STAKE} className={classes.tab}/>
                <Tab label="Unstake on all farms" value={paths.ALL_FARMS_UNSTAKE} className={classes.tab}/>
                <Tab label="Claim from all farms" value={paths.ALL_FARMS_CLAIM} className={classes.tab}/>
            </Tabs>
            <Switch>
                <Route path={paths.ALL_FARMS_STAKE} exact
                       component={WithBalances(balances, balanceDispatch, balance, loading, refresh, farms, StakeAll)}/>
                <Route path={paths.ALL_FARMS_UNSTAKE} exact
                       component={WithBalances(balances, balanceDispatch, balance, loading, refresh, farms, UnstakeAll)}/>
                <Route path={paths.ALL_FARMS_CLAIM} exact
                       component={WithBalances(balances, balanceDispatch, balance, loading, refresh, farms, ClaimAll)}/>
            </Switch>
        </Container>
    );
}

export default AllFarms;