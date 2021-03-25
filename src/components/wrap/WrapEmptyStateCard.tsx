import { Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import SwapHorizontalCircleIcon from '@material-ui/icons/SwapHorizontalCircle';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    padding: theme.spacing(2),
    flexGrow: 1,
    flex: 1,
    backgroundColor: theme.palette.primary.main,
  },
  mainContent: {
    flexGrow: 1,
  },
}));

export default function WrapEmptyStateCard() {
  const classes = useStyles();
  return (
    <Paper className={classes.swapContainer}>
      <Grid container justify="space-between" spacing={2} alignItems="center">
        <Grid item>
          <SwapHorizontalCircleIcon />
        </Grid>
        <Grid item className={classes.mainContent}>
          <Typography variant="subtitle1" display="block">
            Wrap
          </Typography>
          <Typography variant="caption" display="block">
            Please connect your wallets
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
