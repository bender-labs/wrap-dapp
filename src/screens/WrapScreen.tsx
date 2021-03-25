import {
  AppBar,
  Button,
  makeStyles,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import WrapCard from '../features/wrap/WrapCard';

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1,
  },
  toolBarTitle: {
    flexGrow: 1,
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
    <Paper className={classes.swapContainer}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            component="h1"
            variant="h6"
            className={classes.toolBarTitle}
          >
            {tab === Tab.WRAP ? 'wrap' : 'unwrap'}
          </Typography>
          <Button variant="outlined" onClick={toggleSwap} color="inherit">
            {tab === Tab.WRAP ? 'unwrap' : 'wrap'}
          </Button>
        </Toolbar>
      </AppBar>
      {tab === Tab.WRAP && <WrapCard />}
    </Paper>
  );
};
export default WrapScreen;
