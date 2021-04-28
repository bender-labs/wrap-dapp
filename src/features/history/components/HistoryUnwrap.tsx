import * as React from 'react';
import { useMemo } from 'react';
import { AllOperationsHistoryState } from '../../operations/hooks/useAllOperationsHistory';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core';
import { TokenMetadata } from '../../swap/token';
import Amount from '../../../components/formatting/Amount';
import IconSelect from './HistoryTokenSelection';
import { SupportedBlockchain } from '../../wallet/blockchain';
import { ellipsizeAddress } from '../../wallet/address';

const StyledTableCell = withStyles((theme: Theme) =>
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
      '&:first-child': {
        borderRadius: '20px 0 0 20px',
      },
      '&:last-child': {
        borderRadius: '0 20px 20px 0',
      }

    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: '50px'


    },
  })
)(TableRow);


const useStyles = makeStyles((theme) =>
  createStyles({
    table: {
      minWidth:700,
      backgroundColor: '#e5e5e5',
      boxShadow: 'none',
      borderSpacing: '0 5px !important',
      borderCollapse: 'separate'
    },
    wrapper: {
      padding: '20px',
      backgroundColor: '#e5e5e5',
      borderRadius: '0 0 10px 10px'
    }

  })
)


export type HistoryProps = {
  operations: AllOperationsHistoryState;
  canFetch: boolean;
  fungibleTokens: Record<string, TokenMetadata>;
};

export default function History({
                                  operations,
                                  canFetch,
                                  fungibleTokens,
                                }: HistoryProps) {
  const tokensByEthAddress = useMemo(
    () =>
      Object.entries(fungibleTokens).reduce<Record<string, TokenMetadata>>(
        (acc, [, metadata]) => {
          acc[metadata.ethereumContractAddress] = metadata;
          return acc;
        },
        {}
      ),
    [fungibleTokens]
  );
  const classes = useStyles();
  return (
    <div style={{ width: '100%' }}>
      {!canFetch && <span>Connect at least one of your wallet</span>}

      {canFetch && (
        <div className={classes.wrapper}>
          <TableContainer >
            <Table className={classes.table} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Amount</StyledTableCell>
                  <StyledTableCell align="center">Source</StyledTableCell>
                  <StyledTableCell align="center">Destination</StyledTableCell>
                  <StyledTableCell align="center">Status</StyledTableCell>
                  <StyledTableCell align="center">Transaction Hash</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operations.burns.map((row) => (
                  <StyledTableRow key={row.hash}>
                    <StyledTableCell align="center">
                      <IconSelect
                        blockchainTarget={SupportedBlockchain.Tezos}
                        tokenMetadata={tokensByEthAddress[row.token]}
                      />
                      <Amount
                        symbol={tokensByEthAddress[row.token].tezosSymbol}
                        value={row.amount}
                        decimals={tokensByEthAddress[row.token].decimals}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.source}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.destination}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.status.type}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {ellipsizeAddress(row.hash)}
                    </StyledTableCell>

                  </StyledTableRow>
                ))}




              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
}