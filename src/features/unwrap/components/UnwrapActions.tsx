import { Box, Button } from '@material-ui/core';
import React from 'react';
import { UnwrapStatus } from '../hooks/useUnwrap';

export type UnwrapActionsProp = {
  onUnwrap: () => void;
  status: UnwrapStatus;
};

export default function UnwrapActions({ status, onUnwrap }: UnwrapActionsProp) {
  return (
    <Box mt={2} textAlign={'center'}>
      <Button
        variant="contained"
        color="primary"
        onClick={onUnwrap}
        fullWidth
        disabled={status !== UnwrapStatus.READY_TO_UNWRAP}
      >
        UNWRAP
      </Button>
    </Box>
  );
}
