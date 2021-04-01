import React, { useCallback } from 'react';
import { Tab, Tabs, TabsProps } from '@material-ui/core';
import { useHistory } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { paths } from '../../screens/routes';

export const SwapDirectionTab: React.FC<TabsProps> = () => {
  const history = useHistory();
  const { path } = useRouteMatch();
  const onTabChange = useCallback(
    (event: React.ChangeEvent<{}>, newPath: string) => {
      history.push(newPath);
    },
    [history]
  );

  return (
    <>
      <Tabs
        value={path}
        onChange={onTabChange}
        indicatorColor="primary"
        variant="fullWidth"
      >
        <Tab
          label={path === paths.WRAP ? 'Wrapping' : 'Wrap'}
          value={paths.WRAP}
        />
        <Tab
          label={path === paths.UNWRAP ? 'Unwrapping' : 'Unwrap'}
          value={paths.UNWRAP}
        />
      </Tabs>
    </>
  );
};
