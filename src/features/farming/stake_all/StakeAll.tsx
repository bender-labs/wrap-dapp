import {Box, Typography, withStyles} from "@material-ui/core";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import {PaperFooter} from "../../../components/paper/Paper";
import LoadableButton from "../../../components/button/LoadableButton";
import React, {useEffect, useState} from "react";
import {FarmConfig} from "../../../config";
import IconSelect from "../../../screens/farming/FarmToken";
import BigNumber from "bignumber.js";
import {useConfig, useIndexerApi} from "../../../runtime/config/ConfigContext";
import {useTezosContext} from "../../tezos/TezosContext";
import {IndexerContractBalance} from "../../indexer/indexerApi";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {paths} from "../../../screens/routes";
import FarmingContractHeader from "../../../components/farming/FarmingContractHeader";

const StyledTableCell = withStyles(() =>
    createStyles({
        head: {
            backgroundColor: '#e5e5e5',
            color: 'black',
            padding: '0px',
            fontWeight: 'bold'
        },
        body: {
            fontSize: 14,
            padding: '20px',
            backgroundColor: 'white',
            textAlign: 'center',
            '&:first-child': {
                borderRadius: '20px 0 0 20px'
            },
            '&:last-child': {
                borderRadius: '0 20px 20px 0',
                padding: '0px 0px',
                flex: 2
            }
        }
    })
)(TableCell);

const StyledTableRow = withStyles(() =>
    createStyles({
        root: {
            margin: '50px'
        }
    })
)(TableRow);

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
    footer: {
        padding: '20px 280px 0px 280px'
    },
    input: {
        border: 'none',
        padding: '7px',
        backgroundColor: '#e5e5e5',
        textAlign: 'center',

        '&:focus': {
            outline: 'none',
            borderBottomColor: '200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
        }
    }
}));

export default function StakeAll() {
    const classes = useStyles();
    const {farms} = useConfig();
    const indexerApi = useIndexerApi();
    const currentWallet = useTezosContext();
    const [stakingBalances, setStakingBalances] = useState<IndexerContractBalance[]>([]);

    useEffect(() => {
        const loadBalances = async () => {
            if (currentWallet.account) {
                setStakingBalances(await indexerApi.fetchCurrentUserFarmingConfiguration(currentWallet.account));
            }
        }

        // noinspection JSIgnoredPromiseFromCall
        loadBalances();
    }, [currentWallet.account]);

    const findCurrentWalletBalance = (farm: FarmConfig): string => {
        const contractBalance = stakingBalances.find((elt) => {
            return elt.contract === farm.farmContractAddress;
        });
        return contractBalance ?
            new BigNumber(contractBalance.balance).shiftedBy(-farm.farmStakedToken.decimals).toString(10) : "0";
    };

    const renderRow = (farm: FarmConfig) => {
        return (
            <StyledTableRow key={farm.rewardTokenId}>
                <StyledTableCell align='center'>
                    <IconSelect src={farm.rewardTokenThumbnailUri}/>
                </StyledTableCell>
                <StyledTableCell align='center'>
                    {farm.rewardTokenSymbol}
                </StyledTableCell>
                <StyledTableCell
                    align='center'>{new BigNumber(farm.farmTotalStaked).shiftedBy(-farm.farmStakedToken.decimals).toString(10)}</StyledTableCell>
                <StyledTableCell align='center'>{findCurrentWalletBalance(farm)}</StyledTableCell>
                <StyledTableCell align='center'>
                    <input
                        className={classes.input}
                        type='text'
                        placeholder='Enter Amount...'>
                    </input>
                </StyledTableCell>
            </StyledTableRow>
        );
    };

    let active = farms.length > 0;

    return (
        <>
            <FarmingContractHeader title="All farms" path={paths.FARMING_ROOT}/>
            <Box className={classes.containBox}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align='center'>Symbol</StyledTableCell>
                                <StyledTableCell align='center'>Token Name</StyledTableCell>
                                <StyledTableCell align='center'>Total Global Stake</StyledTableCell>
                                <StyledTableCell align='center'>Your current Stake</StyledTableCell>
                                <StyledTableCell align='center'>New Stake</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {active ?
                                farms.map((farmConfig) => renderRow(farmConfig)) :
                                <TableRow><TableCell>No data to display...</TableCell></TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <PaperFooter className={classes.footer}>
                    <LoadableButton
                        loading={false}
                        onClick={() => {
                        }}
                        disabled={false}
                        text={'Stake On All Farms'}
                        variant={'contained'}
                    />
                </PaperFooter>
            </Box>
        </>
    )
}