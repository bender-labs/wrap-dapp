import React from 'react';
import History from './History';
import { createStyles, makeStyles } from '@material-ui/core';
import { useAllOperationsHistory } from '../../operations/hooks/useAllOperationsHistory';

const useStyles = makeStyles(() =>
  createStyles({
    main: {
      display: 'flex',
      justifyContent: 'center',
    },
    history: {
      color: 'white',
      alignItems: 'center',
      textAlign: 'center',
      width: '55%',
      marginBottom: '10px',
      padding: '3px 0 10px 0',
      fontSize: '0.875rem',
      borderBottom: '2px solid #FFD000',
    },
  })
);

export default function HistoryDoneOperations() {
  const classes = useStyles();
  const { operations, canFetch, fungibleTokens } = useAllOperationsHistory();
  return (
    <>
      <div className={classes.main}>
        <p className={classes.history}>HISTORY</p>
      </div>
      <History
        operations={operations}
        canFetch={canFetch}
        fungibleTokens={fungibleTokens}
      />
    </>
  );
}
