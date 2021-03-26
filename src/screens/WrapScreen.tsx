import {
  Button,
  Card,
  CardContent,
  CardHeader,
  makeStyles,
} from '@material-ui/core';
import React, { useState } from 'react';
import WrapCard from '../features/wrap/WrapCard';
import UnwrapCard from '../features/unwrap/UnwrapCard';

const useStyles = makeStyles((theme) => ({
  swapContainer: {},
  toolBarTitle: {
    flexGrow: 1,
  },
  title: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  cardHeaderAction: {
    margin: 'auto',
  },
}));

enum Tab {
  WRAP,
  UNWRAP,
}

const WrapScreen = () => {
  const classes = useStyles();

  const [tab, setTab] = useState<Tab>(Tab.WRAP);

  const toggleSwap = () => {
    setTab(tab === Tab.WRAP ? Tab.UNWRAP : Tab.WRAP);
  };

  return (
    <Card variant={'elevation'}>
      <CardHeader
        className={classes.title}
        title={tab === Tab.WRAP ? 'wrap' : 'unwrap'}
        classes={{
          action: classes.cardHeaderAction,
        }}
        action={
          <Button variant="outlined" onClick={toggleSwap} color="inherit">
            {tab === Tab.WRAP ? 'unwrap' : 'wrap'}
          </Button>
        }
      />
      <CardContent>
        {tab === Tab.WRAP && <WrapCard />}
        {tab === Tab.UNWRAP && <UnwrapCard />}
      </CardContent>
    </Card>
  );
};
export default WrapScreen;
