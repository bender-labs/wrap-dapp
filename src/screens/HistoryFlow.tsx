import React from 'react'
import { Route } from 'react-router-dom';
import History, { HistoryProps } from '../features/history/components/History';
import { paths } from './routes';

import { makeStyles, createStyles } from '@material-ui/core';
import {
  OperationStatus, OperationStatusType,
  OperationType,
  UnwrapErc20Operation,
  WrapErc20Operation
} from '../features/operations/state/types';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(() =>
  createStyles({
    history: {
      color: 'white',
      textAlign: 'center',
      padding: '0px',
      fontSize: '20px'

    }
  })
)

function HistoryForm({
  status,
  walletStatus
  }: HistoryProps) {
  const status1: OperationStatus = {
    type: OperationStatusType.DONE,
    id: 'identifier'
  };
  const operation: WrapErc20Operation = {
    type: OperationType.WRAP,
    amount: new BigNumber(100000),
    transactionHash: 'XXXX',
    status: status1,
    hash: 'AAA',
    source: 'aaa',
    destination: 'bbb',
    token: '0x1234',
    fees: new BigNumber(100000)
  };
  const operations = {
    mints: [operation],
    burns: []
  }
  const classes = useStyles()
  return (
    <>
      <h1 className={classes.history}>HISTORY</h1>
      <History
        mints={operations.mints}
        burns={operations.burns}
        status={status}
        walletStatus={walletStatus}
      />
    </>
  )

}


export default function HistoryFlow() {
  return (
    <>
      <Route exact path={paths.HISTORY} component={HistoryForm} />
    </>
  )
}