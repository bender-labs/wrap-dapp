import {Box, Typography} from "@material-ui/core";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import {PaperFooter} from "../../../components/paper/Paper";
import LoadableButton from "../../../components/button/LoadableButton";
import React, {useState} from "react";
import {FarmConfig} from "../../../config";
import IconSelect from "../../../screens/farming/FarmToken";
import BigNumber from "bignumber.js";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {paths} from "../../../screens/routes";
import FarmingContractHeader from "../../../components/farming/FarmingContractHeader";
import FarmingStyledTableCell from "../../../components/farming/FarmingStyledCell";
import FarmingStyledTableRow from "../../../components/farming/FarmingStyledTableRow";
import WalletConnection from "../../../components/tezos/WalletConnection";
import {useWalletContext} from "../../../runtime/wallet/WalletContext";
import useStakeAll, {NewStake, StakeAllStatus} from "./hook/useStakeAll";
import {FarmAllProps} from "../../../screens/farming/AllFarms";
import {changeBalances} from "../balance-actions";
import {ContractBalance} from "../balances-reducer";

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
        display: 'flex',
        flexFlow: 'row nowrap',
        justifyContent: 'space-around'
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

export default function StakeAll({balances, balanceDispatch, balance, loading, refresh, farms}: FarmAllProps) {
    const classes = useStyles();
    const walletContext = useWalletContext();
    const [newStakes, setNewStakes] = useState<NewStake[]>([]);
    const {stakeAllStatus, stakeAll} = useStakeAll(newStakes);

    const inputChangeHandler = (event: any, contract: string, farmStakedTokenAddress: string, decimals: number) => {
        if (typeof event.target.value !== "undefined" && !isNaN(event.target.value) && event.target.value !== "") {
            let newAmount = parseInt(event.target.value);

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
        } else {
            setNewStakes(newStakes.filter(stake => stake.contract !== contract));
        }
    }

    const total = (): number => {
        return newStakes.reduce((total, elt) => {
            return total + elt.amount;
        }, 0);
    }

    const findCurrentWalletBalance = (farm: FarmConfig): string => {
        const contractBalance = balances.balances.find((elt) => elt.contract === farm.farmContractAddress);
        return new BigNumber(contractBalance?.balance ?? 0).shiftedBy(-farm.farmStakedToken.decimals).toString(10);
    };

    const findFarmTotalStaked = (farm: FarmConfig, balances: ContractBalance[]): string => {
        const currentBalance = balances.find((balance) => balance.contract === farm.farmContractAddress);
        return new BigNumber(currentBalance?.totalStaked ?? 0).shiftedBy(-farm.farmStakedToken.decimals).toString(10);
    };

    const updateBalances = (newStakes: NewStake[]): void => {
        balanceDispatch(changeBalances({
            balances: balances.balances.map((contractBalance) => {
                const newStakeToApply = newStakes.find((newStake) => {
                    return newStake.contract === contractBalance.contract;
                });

                if (newStakeToApply) {
                    const newStakeAmount = new BigNumber(newStakeToApply.amount).shiftedBy(newStakeToApply.stakeDecimals);
                    contractBalance.balance = new BigNumber(contractBalance.balance ?? 0).plus(newStakeAmount).toString(10);
                    contractBalance.totalStaked = new BigNumber(contractBalance.totalStaked ?? 0).plus(newStakeAmount).toString(10);
                }
                return contractBalance;
            })
        }));
    }

    const ditributeEvenly = (): void => {
        if (farms && farms.length > 0 && balance.gt(0)) {
            const amount = balance.dividedBy(farms.length).shiftedBy(-farms[0].farmStakedToken.decimals).dp(farms[0].farmStakedToken.decimals, BigNumber.ROUND_DOWN);
            const newNewStakes = farms.map((farm): NewStake => {
                return {
                    amount: amount.toNumber(),
                    contract: farm.farmContractAddress,
                    stakeDecimals: farm.farmStakedToken.decimals,
                    farmStakedToken: farm.farmStakedToken.contractAddress
                };
            });
            setNewStakes(newNewStakes);
        }
    };

    const findValueForInput = (farmContractAddress: string): string => {
        const stake = newStakes.find((stake) => stake.contract === farmContractAddress);
        return stake ? stake.amount.toString() : "";
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
                    {findFarmTotalStaked(farm, balances.balances)}
                </FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>{findCurrentWalletBalance(farm)}</FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>
                    <input className={classes.input} type='number'
                           onChange={(e) => inputChangeHandler(e, farm.farmContractAddress, farm.farmStakedToken.contractAddress, farm.farmStakedToken.decimals)}
                           value={findValueForInput(farm.farmContractAddress)}
                           placeholder='Enter Amount...'/>
                </FarmingStyledTableCell>
            </FarmingStyledTableRow>
        );
    };

    const isTotalInvalid = (): boolean => {
        if (balance && farms && farms.length > 0) {
            return balance.shiftedBy(-farms[0].farmStakedToken.decimals).isLessThan(total());
        }
        return true;
    }

    const availableTokens = (): string => {
        if (!loading && !balances.isDirty && farms.length > 0 && !balance.isNaN()) {
            return balance.shiftedBy(-farms[0].farmStakedToken.decimals).toString(10);
        }

        return "Loading ...";
    }

    return (
        <>
            <FarmingContractHeader title="All farms" path={paths.FARMING_ROOT}/>
            <Box className={classes.containBox}>
                <PaperFooter>
                    <h4>Available $WRAP tokens: {availableTokens()}</h4>
                </PaperFooter>
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
                    <LoadableButton loading={loading} onClick={ditributeEvenly} disabled={balances.isDirty}
                                    text={'Distribute my tokens evenly'}/>
                    {stakeAllStatus !== StakeAllStatus.NOT_CONNECTED && (
                        <LoadableButton
                            loading={stakeAllStatus === StakeAllStatus.UNSTAKING || balances.isDirty}
                            onClick={async () => {
                                await stakeAll(newStakes);
                                updateBalances(newStakes);
                            }}
                            disabled={stakeAllStatus !== StakeAllStatus.READY || isTotalInvalid()}
                            text={balances.isDirty ? "Waiting for confirmation" : "Stake on all farms"}
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