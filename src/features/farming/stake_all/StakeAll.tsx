import {Box, Typography} from "@material-ui/core";
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
import {IndexerContractBalance} from "../../indexer/indexerApi";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {paths} from "../../../screens/routes";
import FarmingContractHeader from "../../../components/farming/FarmingContractHeader";
import FarmingStyledTableCell from "../../../components/farming/FarmingStyledCell";
import FarmingStyledTableRow from "../../../components/farming/FarmingStyledTableRow";
import WalletConnection from "../../../components/tezos/WalletConnection";
import {useWalletContext} from "../../../runtime/wallet/WalletContext";
import useStakeAll, {NewStake, StakeAllStatus} from "./hook/useStakeAll";

const useStyles = makeStyles((theme) => createStyles({
    table: {
        borderSpacing: '0 5px !important',
        borderCollapse: 'separate'
    },
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
    const walletContext = useWalletContext();
    const [stakingBalances, setStakingBalances] = useState<IndexerContractBalance[]>([]);
    const [newStakes, setNewStakes] = useState<NewStake[]>([]);
    const {stakeAllStatus, stakeAll} = useStakeAll(newStakes);

    const inputChangeHandler = (event: any, contract: string, farmStakedTokenAddress: string, decimals: number) => {
        let newAmount = 0;

        if (typeof event.target.value !== "undefined" && !isNaN(event.target.value) && event.target.value !== "") {
            let eventAmount = parseInt(event.target.value);
            if (eventAmount > 0) {
                newAmount = eventAmount;
            }
        }

        const existingNewStake = newStakes.find((newStake) => {
            return newStake.contract === contract;
        });

        if (existingNewStake) {
            setNewStakes(newStakes.map((newStake) => {
                if (newStake.contract === contract) {
                    newStake.amount = newAmount
                }
                return newStake;
            }));
        } else {
            const newNewStakes = newStakes.slice();
            newNewStakes.push({
                contract: contract,
                farmStakedToken: farmStakedTokenAddress,
                amount: newAmount,
                stakeDecimals: decimals
            });
            setNewStakes(newNewStakes);
        }
    }

    const total = (): number => {
        return newStakes.reduce((total, elt) => {
            return total + elt.amount;
        }, 0);
    }

    useEffect(() => {
        const loadBalances = async () => {
            if (walletContext.tezos.account) {
                setStakingBalances(await indexerApi.fetchCurrentUserFarmingConfiguration(walletContext.tezos.account));
            }
        }

        // noinspection JSIgnoredPromiseFromCall
        loadBalances();
    }, [walletContext.tezos.account]);

    const findCurrentWalletBalance = (farm: FarmConfig): string => {
        const contractBalance = stakingBalances.find((elt) => {
            return elt.contract === farm.farmContractAddress;
        });
        return contractBalance ?
            new BigNumber(contractBalance.balance).shiftedBy(-farm.farmStakedToken.decimals).toString(10) : "0";
    };

    const renderRow = (farm: FarmConfig) => {
        return (
            <FarmingStyledTableRow key={farm.farmContractAddress}>
                <FarmingStyledTableCell align='center'>
                    <IconSelect src={farm.rewardTokenThumbnailUri}/>
                </FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>
                    {farm.rewardTokenSymbol}
                </FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>
                    {new BigNumber(farm.farmTotalStaked ?? 0).shiftedBy(-farm.farmStakedToken.decimals).toString(10)}
                </FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>{findCurrentWalletBalance(farm)}</FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>
                    <input className={classes.input} type='number'
                           onChange={(e) => inputChangeHandler(e, farm.farmContractAddress, farm.farmStakedToken.contractAddress, farm.farmStakedToken.decimals)}
                           placeholder='Enter Amount...'/>
                </FarmingStyledTableCell>
            </FarmingStyledTableRow>
        );
    };

    return (
        <>
            <FarmingContractHeader title="All farms" path={paths.FARMING_ROOT}/>
            <Box className={classes.containBox}>
                <TableContainer>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <FarmingStyledTableCell align='center'>Symbol</FarmingStyledTableCell>
                                <FarmingStyledTableCell align='center'>Token Name</FarmingStyledTableCell>
                                <FarmingStyledTableCell align='center'>Total Global Stake</FarmingStyledTableCell>
                                <FarmingStyledTableCell align='center'>Your current Stake</FarmingStyledTableCell>
                                <FarmingStyledTableCell align='center'>New Stake</FarmingStyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {farms.length > 0 ?
                                farms.map((farmConfig) => renderRow(farmConfig)) :
                                <TableRow><TableCell>No data to display...</TableCell></TableRow>
                            }
                            <FarmingStyledTableRow>
                                <FarmingStyledTableCell align='center'/>
                                <FarmingStyledTableCell align='center'/>
                                <FarmingStyledTableCell/>
                                <FarmingStyledTableCell>
                                    <Typography>
                                        Total :
                                    </Typography>
                                </FarmingStyledTableCell>
                                <FarmingStyledTableCell>
                                    <Typography>
                                        {total()}
                                    </Typography>
                                </FarmingStyledTableCell>
                            </FarmingStyledTableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <PaperFooter className={classes.footer}>
                    {stakeAllStatus !== StakeAllStatus.NOT_CONNECTED && (
                        <LoadableButton
                            loading={stakeAllStatus === StakeAllStatus.UNSTAKING}
                            onClick={async () => {
                                await stakeAll(newStakes);
                                // fakeResetBalances();
                            }}
                            disabled={stakeAllStatus !== StakeAllStatus.READY}
                            text={`Stake on all farms`}
                            variant={'contained'}
                        />
                    )}
                    {stakeAllStatus === StakeAllStatus.NOT_CONNECTED && (
                        <WalletConnection withConnectionStatus={false} account={walletContext.tezos.account}
                                          connectionStatus={walletContext.tezos.status}
                                          activate={walletContext.tezos.activate}
                                          deactivate={walletContext.tezos.deactivate}/>
                    )}
                </PaperFooter>
            </Box>
        </>
    );
}