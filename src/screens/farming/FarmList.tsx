import {FarmConfig} from '../../config';
import {PaperContent} from '../../components/paper/Paper';
import {Grid, IconButton, Typography,} from '@material-ui/core';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import TezosTokenIcon from '../../components/icons/TezosTokenIcon';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';

export type FarmListProps = {
    farms: FarmConfig[];
    onProgramSelect: (farm: string) => void;
};

const useStyle = makeStyles(() => createStyles({
    main: {
        borderRadius: '10px 10px 10px 10px',
        backgroundColor: 'white',
        transition: 'background-color 1s ease',
        '&:hover': {
            backgroundColor: '#FFD000'
        },
    },
    option: {
        fontSize: '20px'
    },
    item: {
        '&:hover': {
            cursor: 'pointer'
        }
    },
    images: {
        '& img': {width: 60, height: 60, marginRight: 5, verticalAlign: 'middle'},
        '& :first-child': {left: '0', position: 'relative'}
    }
}));

function FarmSelector({farmConfig, onClick}: {
    farmConfig: FarmConfig;
    onClick: () => void;
}) {
    const classes = useStyle();

    return (
        <PaperContent className={classes.main}>
            <Grid container justify={'space-between'} alignItems={'center'} onClick={onClick} className={classes.item}>
                <Grid item className={classes.images}>
                    <TezosTokenIcon url={farmConfig.rewardTokenThumbnailUri ?? "ipfs://"}/>
                </Grid>
                <Grid item>
                    <Typography className={classes.option}>
                        {farmConfig.rewardTokenName} farm
                    </Typography>
                </Grid>
                <Grid item>
                    <IconButton>
                        <ArrowForwardIcon/>
                    </IconButton>
                </Grid>
            </Grid>
        </PaperContent>
    );
}

export default function FarmList({farms, onProgramSelect}: FarmListProps) {
    return (
        <Grid container spacing={2} direction={'column'}>
            {farms.map((farmConfig) => (
                <Grid item key={farmConfig.farmContractAddress}>
                    <FarmSelector farmConfig={farmConfig}
                                  onClick={() => onProgramSelect(farmConfig.farmContractAddress)}/>
                </Grid>
            ))}
        </Grid>
    );
};
