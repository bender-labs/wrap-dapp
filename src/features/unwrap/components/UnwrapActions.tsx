import React from 'react';
import { UnwrapStatus } from '../hooks/useUnwrap';
import LoadableButton from '../../../components/button/LoadableButton';

export type UnwrapActionsProp = {
  onUnwrap: () => void;
  status: UnwrapStatus;
};

export default function UnwrapActions({ status, onUnwrap }: UnwrapActionsProp) {
  return (
    <LoadableButton
      loading={status === UnwrapStatus.WAITING_FOR_UNWRAP}
      onClick={onUnwrap}
      disabled={status !== UnwrapStatus.READY_TO_UNWRAP}
      text={'UNWRAP →'}
      color={'black'}

    />
  );
}
