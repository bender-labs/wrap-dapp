import { Box, Typography } from '@material-ui/core';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import { PaperFooter } from '../../../components/paper/Paper';
import LoadableButton from '../../../components/button/LoadableButton';
import React, { useEffect, useState } from 'react';
import { FarmConfig } from '../../../config';
import IconSelect from '../../../screens/farming/FarmToken';
import BigNumber from 'bignumber.js';
import Button from '@material-ui/core/Button';
import { useConfig, useIndexerApi } from '../../../runtime/config/ConfigContext';
import { IndexerContractBalance } from '../../indexer/indexerApi';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { paths } from '../../../screens/routes';
import FarmingContractHeader from '../../../components/farming/FarmingContractHeader';
import FarmingStyledTableCell from '../../../components/farming/FarmingStyledCell';
import FarmingStyledTableRow from '../../../components/farming/FarmingStyledTableRow';
import WalletConnection from '../../../components/tezos/WalletConnection';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import useStakeAll, { NewStake, StakeAllStatus } from './hook/useStakeAll';
import { FarmingContractActionsProps } from '../types';
import useTokenBalance from '../../token/hook/useTokenBalance';

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
    padding: '20px 180px 0px 180px'
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
  },
  buttons: {
    display: 'flex'
  },
  wrapper: {
    margin: theme.spacing(1),
    backgroundColor: '#FFFFFF',
    position: 'relative',
    borderRadius: '25px'
  },
  disButton: {
    textTransform: 'none',
    textAlign: 'center',
    boxShadow: 'none',
    fontWeight: 900,
    borderRadius: '25px',
    border: 'none',
    '&:hover': {
      border: 'none',
      boxShadow: 'none',
      backgroundColor: theme.palette.primary.main
    },
    backgroundColor: '#FFFFFF',
    '&.Mui-disabled': {
      border: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
    }
  }
}));

export function formatAmount(
  balance: BigNumber,
  decimals: number
): string {
  return `${balance.shiftedBy(-decimals).toFormat()}`;
}

export default function StakeAll() {
  const classes = useStyles();
  const { balance } = useTokenBalance((useConfig().farms)[0].farmStakedToken.contractAddress, (useConfig().farms)[0].farmStakedToken.tokenId);
  const indexerApi = useIndexerApi();
  const { farms } = useConfig();
  const walletContext = useWalletContext();
  const [stakingBalances, setStakingBalances] = useState<IndexerContractBalance[]>([]);
  const [newStakes, setNewStakes] = useState<NewStake[]>([]);
  const { stakeAllStatus, stakeAll } = useStakeAll(newStakes);
  const availableStakeTokens = formatAmount(balance, (useConfig().farms)[0].farmStakedToken.decimals);

  const inputChangeHandler = (event: any, contract: string, farmStakedTokenAddress: string, decimals: number) => {
    let newAmount = 0;

    if (typeof event.target.value !== 'undefined' && !isNaN(event.target.value) && event.target.value !== '') {
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
          newStake.amount = newAmount;
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
  };

  const total = (): number => {
    return newStakes.reduce((total, elt) => {
      return total + elt.amount;
    }, 0);
  };

  useEffect(() => {
    const loadBalances = async () => {
      if (walletContext.tezos.account) {
        setStakingBalances(await indexerApi.fetchCurrentUserFarmingConfiguration(walletContext.tezos.account));
      }
    };

    // noinspection JSIgnoredPromiseFromCall
    loadBalances();
  }, [walletContext.tezos.account]);

  const findCurrentWalletBalance = (farm: FarmConfig): string => {
    const contractBalance = stakingBalances.find((elt) => {
      return elt.contract === farm.farmContractAddress;
    });
    return contractBalance ?
      new BigNumber(contractBalance.balance).shiftedBy(-farm.farmStakedToken.decimals).toString(10) : '0';
  };

  const fakeResetBalances = (newStakes: NewStake[]) => {
    setStakingBalances(stakingBalances.map((stake) => {
      const newStakeToApply = newStakes.find((newStake) => {
        return newStake.contract === stake.contract;
      });

      if (newStakeToApply) {
        const newStakeAmount = new BigNumber(newStakeToApply.amount).shiftedBy(newStakeToApply.stakeDecimals);
        stake.balance = new BigNumber(stake.balance).plus(newStakeAmount).toString(10);
      }
      return stake;
    }));
  };

  const distributeEvenly = () => {
    const tokenFarmShare = parseInt(availableStakeTokens) / farms.length;
    const newNewStakes = farms.map((farm): NewStake => {
      return {
        amount: tokenFarmShare,
        contract: farm.farmContractAddress,
        farmStakedToken: farm.farmStakedToken.contractAddress,
        stakeDecimals: farm.farmStakedToken.decimals
      };
    });
    setNewStakes(newNewStakes);
  };

  const renderRow = (farm: FarmConfig) => {
    const existingStake = newStakes.find((newStake) => {
      return newStake.contract === farm.farmContractAddress;
    });

    return (
      <FarmingStyledTableRow key={farm.farmContractAddress}>
        <FarmingStyledTableCell align='center'>
          <IconSelect src={farm.rewardTokenThumbnailUri} />
        </FarmingStyledTableCell>
        <FarmingStyledTableCell align='center'>
          {farm.rewardTokenSymbol}
        </FarmingStyledTableCell>
        <FarmingStyledTableCell align='center'>
          {new BigNumber(farm.farmTotalStaked ?? 0).shiftedBy(-farm.farmStakedToken.decimals).toString(10)}
        </FarmingStyledTableCell>
        <FarmingStyledTableCell align='center'>{findCurrentWalletBalance(farm)}</FarmingStyledTableCell>
        <FarmingStyledTableCell align='center'>
          <input
            className={classes.input}
            type='number'
            onChange={
              (e) => inputChangeHandler(
                e,
                farm.farmContractAddress,
                farm.farmStakedToken.contractAddress,
                farm.farmStakedToken.decimals
              )
            }
            value={existingStake ? existingStake.amount : 0}
            placeholder='Enter Amount...' />
        </FarmingStyledTableCell>
      </FarmingStyledTableRow>
    );
  };

  return (
    <>
      <FarmingContractHeader title='All farms' path={paths.FARMING_ROOT} />
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
                <FarmingStyledTableCell align='center' />
                <FarmingStyledTableCell align='center' />
                <FarmingStyledTableCell>Your available WRAPS: {availableStakeTokens}</FarmingStyledTableCell>
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
            <div className={classes.buttons}>
              <div className={classes.wrapper}>
                <Button className={classes.disButton} onClick={distributeEvenly}>
                  Evenly Split All Tokens In Wallet
                </Button>
              </div>
              <LoadableButton
                loading={stakeAllStatus === StakeAllStatus.UNSTAKING}
                onClick={async () => {
                  await stakeAll(newStakes);
                  fakeResetBalances(newStakes);
                }}
                disabled={stakeAllStatus !== StakeAllStatus.READY}
                text={`Stake On All Farms`}
                variant={'contained'}
              />
            </div>
          )}
          {stakeAllStatus === StakeAllStatus.NOT_CONNECTED && (
            <WalletConnection withConnectionStatus={false} account={walletContext.tezos.account}
                              connectionStatus={walletContext.tezos.status}
                              activate={walletContext.tezos.activate}
                              deactivate={walletContext.tezos.deactivate} />
          )}
        </PaperFooter>
      </Box>
    </>
  );
}