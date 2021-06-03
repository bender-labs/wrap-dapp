import {Box, Container, Typography} from '@material-ui/core';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import React from 'react';
import {useConfig} from '../../runtime/config/ConfigContext';
import FarmList from './FarmList';
import {useHistory} from 'react-router';
import {farmPageRoute} from '../routes';
import BigNumber from "bignumber.js";

const useStyles = makeStyles((theme) => createStyles({
    subtitle: {
        color: '#000000',
        textAlign: 'center',
        marginBottom: '20px'
    },
    containBox: {
        borderRadius: '0 0 10px 10px',
        padding: '30px',
        backgroundColor: '#e5e5e5'
    },
    title: {
        color: 'white',
        borderBottom: '3px solid #ffd000',
        textAlign: 'center',
        fontSize: '30px',
        paddingBottom: '15px'
    },
    titleCenter: {
        justifyItems: 'center'
    },
    total: {
        color: 'white',
        textAlign: 'center',
        fontSize: '30px',
        paddingBottom: '15px'
    }
}));

export default function FarmChoice() {
    const classes = useStyles();
    const history = useHistory();
    const {farms} = useConfig();

    const totalStaked = farms.reduce((total, farm) => {
        const staked = new BigNumber(farm.farmTotalStaked).shiftedBy(-farm.farmStakedToken.decimals);
        return total.plus(staked);
    }, new BigNumber(0)).dp(0).toString(10);

    return (
        <Container maxWidth={'sm'}>
            <Box className={classes.titleCenter} my={2}>
                <Typography className={classes.title}>Fees farming</Typography>
            </Box>
            <Box className={classes.titleCenter} my={2}>
                <Typography className={classes.total}>$WRAP staked : {totalStaked} </Typography>
            </Box>
            <Box className={classes.containBox}>
                <Typography variant={'subtitle1'} className={classes.subtitle}>Select a farm to stake, unstake or claim
                    your fees share.</Typography>
                <FarmList farms={farms} onProgramSelect={(farmContract) => {
                    history.push(farmPageRoute(farmContract));
                }}/>
            </Box>
        </Container>
    );
}
