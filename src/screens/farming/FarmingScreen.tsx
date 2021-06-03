import React from 'react';
import {farmingPaths, paths} from '../routes';
import {Route} from 'react-router-dom';

import FarmChoice from './FarmChoice';
import Farm from './Farm';
import FarmStakeAllScreen from './FarmStakeAllScreen';

import {Container} from '@material-ui/core'

export default function FarmingScreen() {
    return (
        <Container maxWidth={'md'}>
            <Route exact path={paths.FARMING} component={FarmChoice}/>
            <Route exact path={paths.FARMING_STAKE_ALL} component={FarmStakeAllScreen}/>
            <Route exact path={farmingPaths} component={Farm}/>
        </Container>
    )
}
