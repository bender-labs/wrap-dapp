import React, { useCallback } from 'react';
import History from './History';
import { createStyles, makeStyles, Tab, Tabs } from '@material-ui/core';
import { useAllOperationsHistory } from '../../operations/hooks/useAllOperationsHistory';
import { useHistory } from 'react-router';

const useStyles = makeStyles(() =>
  createStyles({
    main: {
      display: 'flex',

    },
    history: {
      color: 'white',
      justifyContent: 'flex-start',
      alignItems: 'center',
      textAlign: 'center',
      width: '35%',
      marginBottom: '10px',
      padding: '3px 0 10px 0',
      fontSize: '0.875rem',
      borderBottom: '2px solid #FFD000',
    },
    tabs: {
      color: 'white',
      justifyContent: 'flex-end'
    }
  })
);

export default function HistoryDoneOperations() {
  const classes = useStyles();
  const history = useHistory();
  const { operations, canFetch, fungibleTokens } = useAllOperationsHistory();
  const onTabChange = useCallback(
    (event: React.ChangeEvent<{}>, newPath: string) => {
      history.push(newPath);
    },
    [history]
  );
  return (
    <>
      <div className={classes.main}>
        <p className={classes.history}>HISTORY</p>
          <div>
        <Tabs
          value='placeholeder'
          onChange={onTabChange}
          className={classes.tabs}
        >
            <Tab
            label='wraps'
            value='completed-Wraps'
          />
            <Tab
            label='Unwraps'
            value='completed-Unwraps'
          />

          </Tabs>
          </div>
      </div>
      <History
        operations={operations}
        canFetch={canFetch}
        fungibleTokens={fungibleTokens}
      />
    </>
  );
}
