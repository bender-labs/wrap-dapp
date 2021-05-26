import {PaperActions, PaperHeader, PaperNav, PaperTitle,} from '../paper/Paper';
import {IconButton} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React from 'react';
import {FarmConfig} from '../../config';
import {useHistory} from 'react-router';
import {paths} from "../../screens/routes";

export default function FarmingContractHeader({farm}: {
    farm: FarmConfig;
}) {
    const history = useHistory();
    return (
        <PaperHeader>
            <PaperNav>
                <IconButton
                    onClick={() => {
                        history.push(paths.FARMING);
                    }}
                >
                    <ArrowBackIcon/>
                </IconButton>
            </PaperNav>
            <PaperTitle>
                {farm.rewardTokenName} farm
            </PaperTitle>
            <PaperActions/>
        </PaperHeader>
    );
}
