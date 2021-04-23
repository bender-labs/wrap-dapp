import * as React from 'react';
import { useMemo } from 'react';
import { AllOperationsHistoryState } from '../../operations/hooks/useAllOperationsHistory';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core';
import { TokenMetadata } from '../../swap/token';
import Amount from '../../../components/formatting/Amount';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
      padding: '20px',
    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#e5e5e5',
    },
  })
)(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

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
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Token</StyledTableCell>
                <StyledTableCell align="center">Amount</StyledTableCell>
                <StyledTableCell align="center">Type</StyledTableCell>
                <StyledTableCell align="center">Treatment</StyledTableCell>
                <StyledTableCell align="center">Date</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {operations.mints.map((row) => (
                <StyledTableRow key={row.hash}>
                  <StyledTableCell align="center" scope="row">
                    {row.token}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Amount
                      symbol={tokensByEthAddress[row.token].ethereumSymbol}
                      value={row.amount}
                      decimals={tokensByEthAddress[row.token].decimals}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row.type === 0 ? 'Wrap' : 'Unwrap'}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row.destination}
                  </StyledTableCell>
                  <StyledTableCell align="center">{row.hash}</StyledTableCell>
                </StyledTableRow>
              ))}
              {operations.burns.map((row) => (
                <StyledTableRow key={row.hash}>
                  <StyledTableCell align="center" scope="row">
                    {row.token}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Amount
                      symbol={tokensByEthAddress[row.token].tezosSymbol}
                      value={row.amount}
                      decimals={tokensByEthAddress[row.token].decimals}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row.type === 0 ? 'Wrap' : 'Unwrap'}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row.destination}
                  </StyledTableCell>
                  <StyledTableCell align="center">{row.hash}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
