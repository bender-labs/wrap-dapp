import React from 'react';
import BigNumber from 'bignumber.js';
import LoadableButton from '../../../components/button/LoadableButton';

type Props = {
  currentAllowance: BigNumber;
  balanceToWrap: BigNumber;
  onAuthorize: () => void;
  loading: boolean;
};

export default function AllowanceButton({
  currentAllowance,
  balanceToWrap,
  onAuthorize,
  loading,
}: Props) {
  const { finalized, disabled, text } = balanceToWrap.lte(currentAllowance)
    ? {
        finalized: true,
        disabled: true,
        text: 'Allowed',
      }
    : {
        finalized: false,
        disabled: false,
        text: 'Allow',
      };

  return (
    <LoadableButton
      loading={loading}
      onClick={onAuthorize}
      disabled={disabled}
      text={text}
      finalized={finalized}
    />
  );
}
