import { makeStyles } from '@material-ui/core';
import React from 'react';
import { useConfig } from '../../runtime/config/ConfigContext';

const useStyles = makeStyles((theme) => ({
  env: {
    marginTop: theme.spacing(1),
    textAlign: 'center',
    fontSize: 12,
    color: '#FFFFFF',
  },
}));

export default function DisplayEnvironment() {
  const classes = useStyles();
  const { environmentName } = useConfig();
  return <div className={classes.env}>{environmentName}</div>;
}
