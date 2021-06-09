import React, {useCallback} from 'react';
import {Container, Tab, Tabs} from '@material-ui/core';
import {Route, Switch} from 'react-router-dom';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {paths} from "../routes";
import UnstakeAll from "../../features/farming/unstake_all/UnstakeAll";
import ClaimAll from "../../features/farming/claim_all/ClaimAll";
import {useHistory, useRouteMatch} from "react-router";
import StakeAll from "../../features/farming/stake_all/StakeAll";

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

function AllFarms() {
    const {path} = useRouteMatch();
    const classes = useStyles();
    const history = useHistory();

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
                <Route path={paths.ALL_FARMS_STAKE} exact component={StakeAll}/>
                <Route path={paths.ALL_FARMS_UNSTAKE} exact component={UnstakeAll}/>
                <Route path={paths.ALL_FARMS_CLAIM} exact component={ClaimAll}/>
            </Switch>
        </Container>
    );
}

export default AllFarms;