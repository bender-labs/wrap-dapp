import React from 'react';
import { Route } from 'react-router-dom';
import History from '../features/history/components/History';
import { paths } from './routes';

import { makeStyles, createStyles } from '@material-ui/core';
import { useAllOperationsHistory } from '../features/operations/hooks/useAllOperationsHistory';

const useStyles = makeStyles(() =>
  createStyles({
    history: {
      color: 'white',
      textAlign: 'center',
      width: '75%',
      padding: '6px',
      fontSize: '0.875rem',
      borderBottom: '3px solid red'
},

  })
);

function HistoryForm() {
  const classes = useStyles();
  const { operations, canFetch } = useAllOperationsHistory();
  return (
    <>
      <h1 className={classes.history}>HISTORY</h1>
      <History operations={operations} canFetch={canFetch} />
    </>
  );
}

export default function HistoryFlow() {
  return (
    <>
      <Route exact path={paths.HISTORY} component={HistoryForm} />
    </>
  );
}
