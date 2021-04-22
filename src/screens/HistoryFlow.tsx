import React from 'react';
import { Route } from 'react-router-dom';
import History from '../features/history/components/History';
import { paths } from './routes';
import { makeStyles, createStyles } from '@material-ui/core';
import { useAllOperationsHistory } from '../features/operations/hooks/useAllOperationsHistory';

const useStyles = makeStyles(() =>
  createStyles({
    main: {
      display: 'flex',
      justifyContent: 'center'
    },
    history: {
      color: 'white',
      alignItems: 'center',
      textAlign: 'center',
      width: '55%',
      marginBottom: '10px',
      padding: '3px 0 10px 0',
      fontSize: '0.875rem',
      borderBottom: '2px solid #FFD000'
},

  })
);

function HistoryForm() {
  const classes = useStyles();
  const { operations, canFetch } = useAllOperationsHistory();
  return (
    <>
      <div className={classes.main}>
        <p className={classes.history}>HISTORY</p>
      </div>
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
