import { Box, LinearProgress, LinearProgressProps } from '@material-ui/core';
import { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyle = makeStyles(() => ({
  root: {
    width: '100%',
  },
}));

export function CircularProgressWithLabel(
  props: LinearProgressProps & { label: string | ReactNode }
) {
  const classes = useStyle();
  return (
    <Box alignItems={'center'} className={classes.root}>
      <Box width="100%">
        <LinearProgress variant="determinate" {...props} />
      </Box>

      <Box alignItems="center" justifyContent="center" textAlign="center">
        {props.label}
      </Box>
    </Box>
  );
}
