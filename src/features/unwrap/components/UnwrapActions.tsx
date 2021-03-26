import { Button } from '@material-ui/core';
import React from 'react';
import { UnwrapStatus } from '../../../components/unwrap/useUnwrap';

export type UnwrapActionsProp = {
  onUnwrap: () => void;
  status: UnwrapStatus;
};

export default function UnwrapActions({ status, onUnwrap }: UnwrapActionsProp) {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={onUnwrap}
      disabled={status !== UnwrapStatus.READY_TO_UNWRAP}
    >
      UNWRAP
    </Button>
  );
}
