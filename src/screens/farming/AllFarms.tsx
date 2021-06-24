import React, {useCallback, useMemo} from 'react';
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
    balanceDispatch: React.Dispatch<Action>
}

function WithBalances(balances: BalancesState,
                      balanceDispatch: React.Dispatch<Action>,
                      Comp: React.FunctionComponent<FarmAllProps>) {
    return () => (
        <Comp balances={balances} balanceDispatch={balanceDispatch}/>
    );
}

function AllFarms() {
    const {path} = useRouteMatch();
    const classes = useStyles();
    const history = useHistory();
    const {balances, balanceDispatch} = useBalances();

    const onTabChange = useCallback(
        (event: React.ChangeEvent<{}>, newPath: string) => {
            history.push(newPath);
        },
        [history]
    );

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
                       component={WithBalances(balances, balanceDispatch, StakeAll)}/>
                <Route path={paths.ALL_FARMS_UNSTAKE} exact
                       component={WithBalances(balances, balanceDispatch, UnstakeAll)}/>
                <Route path={paths.ALL_FARMS_CLAIM} exact
                       component={WithBalances(balances, balanceDispatch, ClaimAll)}/>
            </Switch>
        </Container>
    );
}

export default AllFarms;