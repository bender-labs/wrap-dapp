import React, { useCallback } from 'react';
import History from './History';
import { createStyles, makeStyles, Tab, Tabs } from '@material-ui/core';
import { useAllOperationsHistory } from '../../operations/hooks/useAllOperationsHistory';
import { useHistory } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { paths } from '../../../screens/routes'

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
  const { path } = useRouteMatch()
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
          value={path}
          onChange={onTabChange}
          className={classes.tabs}
          indicatorColor="primary"
        >
            <Tab
            label='wraps'
            value={paths.HISTORY_WRAP}
          />
            <Tab
            label='Unwraps'
            value={paths.HISTORY_UNWRAP}
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
