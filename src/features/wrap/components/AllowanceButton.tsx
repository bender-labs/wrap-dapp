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
  const { color, disabled, text } = balanceToWrap.lte(currentAllowance)
    ? {
        color: 'primary',
        disabled: true,
        text: `Allow`,
      }
    : {
        color: 'secondary',
        disabled: false,
        text: `Allow`,
      };

  return (
    <LoadableButton
      loading={loading}
      onClick={onAuthorize}
      disabled={disabled}
      text={text}
      color={color}
    />
  );
}
