import FarmingContractHeader from "../../../components/farming/FarmingContractHeader";
import {Box, Table, TableBody, Typography} from "@material-ui/core";
import {paths} from "../../../screens/routes";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React, {useEffect, useState} from "react";
import {PaperFooter} from "../../../components/paper/Paper";
import LoadableButton from "../../../components/button/LoadableButton";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import {useConfig, useIndexerApi} from "../../../runtime/config/ConfigContext";
import {IndexerContractBalance} from "../../indexer/indexerApi";
import {FarmConfig} from "../../../config";
import IconSelect from "../../../screens/farming/FarmToken";
import BigNumber from "bignumber.js";
import useUnstakeAll, {UnstakeAllStatus} from "./hook/useUnstakeAll";
import WalletConnection from "../../../components/tezos/WalletConnection";
import {useWalletContext} from "../../../runtime/wallet/WalletContext";
import FarmingStyledTableCell from "../../../components/farming/FarmingStyledCell";
import FarmingStyledTableRow from "../../../components/farming/FarmingStyledTableRow";

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

export default function UnstakeAll() {
    const classes = useStyles();
    const {farms} = useConfig();
    const indexerApi = useIndexerApi();
    const walletContext = useWalletContext();
    const [stakingBalances, setStakingBalances] = useState<IndexerContractBalance[]>([]);
    const {unstakeAllStatus, unstakeAll} = useUnstakeAll(stakingBalances);

    useEffect(() => {
        const loadBalances = async () => {
            if (walletContext.tezos.account) {
                const currentIndexerStakingBalances = await indexerApi.fetchCurrentUserFarmingConfiguration(walletContext.tezos.account);
                const stakingBalancesToKeep = currentIndexerStakingBalances.map((currentIndexerStakingBalance) => {
                    const stateStakingBalance = stakingBalances.find((stakingBalance) => {
                        return stakingBalance.contract === currentIndexerStakingBalance.contract;
                    });

                    if (stateStakingBalance && stateStakingBalance.maxLevelProcessed >= currentIndexerStakingBalance.maxLevelProcessed) {
                        return stateStakingBalance;
                    }
                    return currentIndexerStakingBalance;
                });

                setStakingBalances(stakingBalancesToKeep);
            }
        }

        // noinspection JSIgnoredPromiseFromCall
        loadBalances();
    }, [walletContext.tezos.account, indexerApi]);

    const findCurrentWalletBalance = (farm: FarmConfig): string => {
        const contractBalance = stakingBalances.find((elt) => {
            return elt.contract === farm.farmContractAddress;
        });
        return contractBalance ?
            new BigNumber(contractBalance.balance).shiftedBy(-farm.farmStakedToken.decimals).toString(10) : "0";
    };

    const renderRow = (farm: FarmConfig, index: number) => {
        return (
            <FarmingStyledTableRow key={farm.rewardTokenId}>
                <FarmingStyledTableCell align='center'>
                    <IconSelect src={farm.rewardTokenThumbnailUri}/>
                </FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>
                    {farm.rewardTokenSymbol}
                </FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>{findCurrentWalletBalance(farm)}</FarmingStyledTableCell>
            </FarmingStyledTableRow>
        );
    };

    const total = () => {
        return stakingBalances.reduce((total, contract) => {
            return total.plus(contract.balance);
        }, new BigNumber(0)).shiftedBy(-8).toString(10);
    }

    const fakeResetBalances = () => {
        setStakingBalances(stakingBalances.map((stake) => {
            stake.balance = "0";
            return stake;
        }));
    }

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
                                <FarmingStyledTableCell align='center'>Your current Stake</FarmingStyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {farms.length > 0 ?
                                farms.map((farmConfig, index) => renderRow(farmConfig, index)) :
                                <TableRow><TableCell>No data to display...</TableCell></TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <PaperFooter className={classes.footer}>
                    {unstakeAllStatus !== UnstakeAllStatus.NOT_CONNECTED && (
                        <LoadableButton
                            loading={unstakeAllStatus === UnstakeAllStatus.UNSTAKING}
                            onClick={async () => {
                                await unstakeAll();
                                fakeResetBalances();
                                //todo reset inputs
                            }}
                            disabled={unstakeAllStatus !== UnstakeAllStatus.READY}
                            text={`Unstake ${total()} $WRAP tokens`}
                            variant={'contained'}
                        />
                    )}
                    {unstakeAllStatus === UnstakeAllStatus.NOT_CONNECTED && (
                        <WalletConnection withConnectionStatus={false} account={walletContext.tezos.account}
                                          connectionStatus={walletContext.tezos.status}
                                          activate={walletContext.tezos.activate}
                                          deactivate={walletContext.tezos.deactivate}/>
                    )}
                </PaperFooter>
            </Box>
        </>
    );
};