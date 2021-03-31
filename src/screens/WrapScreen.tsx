import { Badge, makeStyles, Paper, Tab, Tabs } from '@material-ui/core';
import React, { useState } from 'react';
import WrapCard from '../features/wrap/WrapCard';
import UnwrapCard from '../features/unwrap/UnwrapCard';
import OperationList from '../features/operations/components/OperationList';
import {
  pendingOperationsCount,
  useOperationsPolling,
} from '../features/operations/state/pendingOperations';
import { useRecoilValue } from 'recoil';

const useStyles = makeStyles((theme) => ({
  swapContainer: {},
  toolBarTitle: {
    flexGrow: 1,
  },
  bar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  title: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  cardHeaderAction: {
    margin: 'auto',
  },
}));

enum Current {
  WRAP,
  UNWRAP,
  FINALIZE,
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const WrapScreen = () => {
  const classes = useStyles();
  useOperationsPolling();
  const operationsCount = useRecoilValue(pendingOperationsCount);
  const [tab, setTab] = useState<Current>(Current.WRAP);

  return (
    <Paper variant={'elevation'}>
      <Tabs
        variant={'fullWidth'}
        className={classes.bar}
        value={tab}
        onChange={(_, v) => setTab(v)}
      >
        <Tab label="WRAP" />
        <Tab label="UNWRAP" />
        <Tab
          label={
            <React.Fragment>
              <Badge badgeContent={operationsCount} color={'secondary'}>
                FINALIZE
              </Badge>
            </React.Fragment>
          }
        />
      </Tabs>
      <TabPanel value={tab} index={Current.WRAP}>
        <WrapCard />
      </TabPanel>
      <TabPanel index={Current.UNWRAP} value={tab}>
        <UnwrapCard />
      </TabPanel>
      <TabPanel index={Current.FINALIZE} value={tab}>
        <OperationList />
      </TabPanel>
    </Paper>
  );
};
export default WrapScreen;
