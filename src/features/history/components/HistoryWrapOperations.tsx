import React, { useCallback } from 'react';
import HistoryWrap from './HistoryWrap';
import { createStyles, makeStyles, Tab, Tabs } from '@material-ui/core';
import { useAllOperationsHistory } from '../../operations/hooks/useAllOperationsHistory';
import { useHistory } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { paths } from '../../../screens/routes';

const useStyles = makeStyles(() =>
  createStyles({
    main: {
      display: 'flex'

    },


    tabs: {
      color: 'white',
      marginBottom: '10px'
    }
  })
);

export default function HistoryWrapOperations() {
  const classes = useStyles();
  const history = useHistory();
  const { path } = useRouteMatch();
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

        <div>
          <Tabs
            value={path}
            onChange={onTabChange}
            className={classes.tabs}
            indicatorColor='primary'
          >
            <Tab
              label='Wraps'
              value={paths.HISTORY_WRAP}
            />
            <Tab
              label='Unwraps'
              value={paths.HISTORY_UNWRAP}
            />

          </Tabs>
        </div>
      </div>
      <HistoryWrap
        operations={operations}
        canFetch={canFetch}
        fungibleTokens={fungibleTokens}
      />
    </>
  );
}
