import FarmingContractHeader from "../../../components/farming/FarmingContractHeader";
import {paths} from "../../../screens/routes";
import {Box, Table, TableBody} from "@material-ui/core";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {PaperFooter} from "../../../components/paper/Paper";
import LoadableButton from "../../../components/button/LoadableButton";
import WalletConnection from "../../../components/tezos/WalletConnection";
import React from "react";
import {useConfig} from "../../../runtime/config/ConfigContext";
import {useWalletContext} from "../../../runtime/wallet/WalletContext";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {FarmConfig} from "../../../config";
import IconSelect from "../../../screens/farming/FarmToken";
import useClaimAll, {ClaimAllStatus} from "./hook/useClaimAll";
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

export default function ClaimAll() {
    const classes = useStyles();
    const {farms} = useConfig();
    const walletContext = useWalletContext();
    const {claimAllStatus, claimAll, claimBalances} = useClaimAll(farms);

    const findCurrentPendingReward = (farm: FarmConfig): string => {
        const farmWithEarnings = claimBalances.find((claimBalance) => {
            return claimBalance.farmContractAddress === farm.farmContractAddress;
        });
        return farmWithEarnings ? farmWithEarnings.earned.shiftedBy(-farmWithEarnings.rewardTokenDecimals).toString(10) : "0";
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
                <FarmingStyledTableCell align='center'>{findCurrentPendingReward(farm)}</FarmingStyledTableCell>
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
                                <FarmingStyledTableCell align='center'>Your pending reward</FarmingStyledTableCell>
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
                    {claimAllStatus !== ClaimAllStatus.NOT_CONNECTED && (
                        <LoadableButton
                            loading={claimAllStatus === ClaimAllStatus.UNSTAKING}
                            onClick={async () => {
                                await claimAll();

                            }}
                            disabled={claimAllStatus !== ClaimAllStatus.READY}
                            text={"Claim from all farms"}
                            variant={'contained'}
                        />
                    )}
                    {claimAllStatus === ClaimAllStatus.NOT_CONNECTED && (
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
