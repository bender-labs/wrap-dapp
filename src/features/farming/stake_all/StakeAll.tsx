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
import useStakeAll, {NewStake, StakeAllStatus} from "./hook/useStakeAll";
import WalletConnection from "../../../components/tezos/WalletConnection";
import {useWalletContext} from "../../../runtime/wallet/WalletContext";

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
    const {stakeAllStatus, stakeAll} = useStakeAll([
        {
            amount: 100,
            contract: "KT1EsrWB1fpPrwz2E3RWTHxL6p146gXeV4xB"
        },
        {
            amount: 11,
            contract: "KT1BWxkr6c1w6q29WPHKH28ZUo4xJM2yZJUq"
        }
    ]);

    const [values, setValues] = useState([]);
    const [value1, setValue1] = useState(0);
    const [value2, setValue2] = useState(0);
    const [value3, setValue3] = useState(0);

    const valueHandler = (e: any, index: number) => {
        switch (index) {
            case 0:
                setValue1(parseInt(e.target.value));
                break;
            case 1:
                setValue2(parseInt(e.target.value));
                break;
            case 2:
                setValue3(parseInt(e.target.value));
                break;
            default:
                return;
        }
    }

    const newValueHandler = (e: any, index: number) => {

        let val: any[] = values;
        val[index] = e.target.value;
        setValues(values)

        // setValues(values.concat(e.target.value))
        // let newArr = []
        // newArr.push(parseInt(val[index]))

        // console.log(newValues[index][e.target.name]) = e.target.value;
        // console.log(newValues)
        // console.log(newArr)
        // console.log('parsed val[index]', parseInt(val[index]))
        console.log('values', values)

    }

    const totalA = () => {
        let arr = values.map((v) => {
            return parseInt(v)
        })

        let total = arr.reduce((a, b) => a + b, 0);
        return total;
    }

    const totalB = () => {
        let val1 = value1;
        let val2 = value2;
        let val3 = value3;
        let totalAll = [val1, val2, val3];


        return totalAll.reduce((a, b) => a + b, 0)
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

    const renderRow = (farm: FarmConfig, index: number) => {
        return (
            <FarmingStyledTableRow key={farm.rewardTokenId}>
                <FarmingStyledTableCell align='center'>
                    <IconSelect src={farm.rewardTokenThumbnailUri}/>
                </FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>
                    {farm.rewardTokenSymbol}
                </FarmingStyledTableCell>
                <FarmingStyledTableCell
                    align='center'>{new BigNumber(farm.farmTotalStaked).shiftedBy(-farm.farmStakedToken.decimals).toString(10)}</FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>{findCurrentWalletBalance(farm)}</FarmingStyledTableCell>
                <FarmingStyledTableCell align='center'>
                    <input className={classes.input} type='number' onChange={(e) => valueHandler(e, index)}
                           placeholder='Enter Amount...'>
                    </input>
                </FarmingStyledTableCell>
            </FarmingStyledTableRow>
        );
    };

    let active = farms.length > 0;

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
                            {active ?
                                farms.map((farmConfig, index) => renderRow(farmConfig, index)) :
                                <TableRow><TableCell>No data to display...</TableCell></TableRow>
                            }
                            <FarmingStyledTableRow>
                                <FarmingStyledTableCell align='center'>
                                </FarmingStyledTableCell>
                                <FarmingStyledTableCell align='center'>
                                    <Typography>
                                        Totals:
                                    </Typography>
                                </FarmingStyledTableCell>
                                <FarmingStyledTableCell></FarmingStyledTableCell>
                                <FarmingStyledTableCell>0</FarmingStyledTableCell>
                                <FarmingStyledTableCell>
                                    <Typography>
                                        {totalA()}
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
                                await stakeAll();
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