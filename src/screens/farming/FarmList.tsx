import {FarmConfig} from '../../config';
import {PaperContent} from '../../components/paper/Paper';
import {Grid, IconButton, Typography,} from '@material-ui/core';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import TezosTokenIcon from '../../components/icons/TezosTokenIcon';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import BigNumber from "bignumber.js";
import {DateTime} from "luxon";

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
    rewards: {
        fontSize: '12px'
    },
    item: {
        '&:hover': {
            cursor: 'pointer'
        }
    },
    leftGridItem: {
        flexGrow: 1,
        paddingLeft: "20px",
        textAlign: "left"
    },
    images: {
        '& img': {width: 60, height: 60, marginRight: 5, verticalAlign: 'middle'},
        '& :first-child': {left: '0', position: 'relative'}
    }
}));

function Rewards({
                     farmConfig,
                     className
                 }: { farmConfig: FarmConfig, className: string }) {
    if (farmConfig.rewards) {
        const currentTotalRewards = new BigNumber(farmConfig.rewards.totalRewards).shiftedBy(-farmConfig.rewardTokenDecimals).dp(8).toString(10);
        const currentStakedTotens = new BigNumber(farmConfig.farmTotalStaked).shiftedBy(-farmConfig.farmStakedToken.decimals).dp(8).toString(10);
        const nextRewardTime = DateTime.fromMillis(new Date(farmConfig.rewards.startTimestamp).getTime()).plus({"minutes": parseInt(farmConfig.rewards.duration)});

        const nextRewardLabel = nextRewardTime.toMillis() < new Date().getTime() ?
            "Awaiting new rewards period" :
            `New rewards will be added ${nextRewardTime.toRelative({locale: 'en'})}`;

        return (
            <>
                <Typography className={className}>Current
                    available {farmConfig.rewardTokenSymbol} rewards: {currentTotalRewards}</Typography>
                <Typography className={className}>Current
                    staked {farmConfig.farmStakedToken.symbol} tokens: {currentStakedTotens}</Typography>
                <Typography className={className}>{nextRewardLabel}</Typography>
            </>
        );
    }
    return (<></>);
}

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
                <Grid item className={classes.leftGridItem}>
                    <Typography className={classes.option}>
                        {farmConfig.rewardTokenName} farm
                    </Typography>
                    <Rewards farmConfig={farmConfig} className={classes.rewards}/>
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
