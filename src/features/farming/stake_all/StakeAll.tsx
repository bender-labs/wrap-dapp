
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
import {useTezosContext} from "../../tezos/TezosContext";
import {IndexerContractBalance} from "../../indexer/indexerApi";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {paths} from "../../../screens/routes";
import FarmingContractHeader from "../../../components/farming/FarmingContractHeader";
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

export default function StakeAll() {
    const classes = useStyles();
    const {farms} = useConfig();
    const indexerApi = useIndexerApi();
    const currentWallet = useTezosContext();
    const [stakingBalances, setStakingBalances] = useState<IndexerContractBalance[]>([]);

    const [values, setValues] = useState([]);

    const changeHandler = (e: any, index: number) => {


        // make a copy of an array
        // let copy: never[] = [...values]
        // copy[index] = e.target.value
        // let copy = values.map((x) => x)

        // copy.split`,`.map(x=>+x)

        // make sure is array of numbers type
        // ??...

        // let newCopy = copy.map((i, index) => { return parseInt(i) })
        // setValues(newCopy)



        let val: any[] = values;
        let newArr: never[] = [];

        // console.log('newArr', newArr)
        val[index] = e.target.value;

        // make change here to take care of values you must reject
        if(Number(isNaN(val[index]))) {
            val[index] = e.target.value || "0";
        }
        // Array.from(values, i => i || 0)

        console.log(values)



        setValues(newArr.concat(values))



    }

    const total = () => {
        // try to not need this
        let arr = values.map((v) => {
            return parseInt(v)
        })


        return arr.reduce((a, b) => a + b, 0);
    }

   

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
                    <input className={classes.input} type='number' onChange={(e) => changeHandler(e, index)}
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
                                        {total()}
                                    </Typography>
                                </FarmingStyledTableCell>
                            </FarmingStyledTableRow>
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
    );
}