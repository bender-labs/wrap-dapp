import React from 'react';
import { Box, Container, Typography, withStyles } from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import LoadableButton from '../../components/button/LoadableButton';
import { PaperFooter } from '../../components/paper/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { FarmConfig } from '../../config';
import { useConfig } from '../../runtime/config/ConfigContext';
import IconSelect from './FarmToken';

import BigNumber from 'bignumber.js';

export type FarmListProps = {
  farms: FarmConfig[];
};


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
    borderBottom: '2px solid #ffd000',
    '&:focus': {
      outline: 'none'

    }
  }
}));


function FarmStakeAllScreen() {


  const classes = useStyles();
  const { farms } = useConfig();

  const renderRow = (farm: FarmConfig) => {
    console.log(new BigNumber(farm.farmTotalStaked).shiftedBy(-8).toString());
    return (
      <StyledTableRow key={farm.rewardTokenId}>
        <StyledTableCell align='center'>
          <IconSelect src={farm.rewardTokenThumbnailUri}/>
          {farm.rewardTokenSymbol}
        </StyledTableCell>
        <StyledTableCell align='center'>{farm.rewardTokenDecimals}</StyledTableCell>
        <StyledTableCell align='center'>{new BigNumber(farm.farmTotalStaked).shiftedBy(-8).toString()}</StyledTableCell>
        <StyledTableCell align='center'>
          <input
            className={classes.input}
            type='text'
            placeholder='0'>
          </input>
        </StyledTableCell>
      </StyledTableRow>
  );
  };
  let active = farms.length > 0;
  return (
    <Container>
      <Box className={classes.titleCenter} my={2}>
        <Typography className={classes.title}>Stake On All Farms</Typography>
      </Box>
      <Box className={classes.containBox}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell align='center'>Symbol</StyledTableCell>
                <StyledTableCell align='center'>Your Stake</StyledTableCell>
                <StyledTableCell align='center'>Total Global Stake</StyledTableCell>
                <StyledTableCell align='center'>New Stake</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>

              {active ? (farms.map((farmConfig) => renderRow(farmConfig))
              ) : (<TableRow><TableCell>No data to display...</TableCell></TableRow>)
              }


            </TableBody>
          </Table>

        </TableContainer>
        {/* // the list of existing farms
       // For each farm that exits
       // We will create a line of a table
       // On this line there will be the name of farm, ie DAI farm, the user staked amount, the total staked amount
       // and lastly on each line there will be an input field for the user to choose how much to stake on this farm

        // at the bottom of the table, there will be a button to launch the staking on all farms


        // Property -> the list of the farms



        //You have 1000 wrap Tokens

        // SYMBOL, Your stake, Total global stake, New stake
        //DAI     10            90                <200>
        //UNI your stake : 0, total : 88,  <50>
        //FAU your stake : 5, total: 2000  <150>
        //wETH your stake : 0, total 2000 <>

        // [STAKE ON ALL FARMS]

        

         */}
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
    </Container>
  );
  }

  export default FarmStakeAllScreen;