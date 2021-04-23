import React from 'react';
import BigNumber from 'bignumber.js';
import LabelAndValue from './LabelAndValue';
import Amount from './Amount';

export type LabelAndAssetProps = {
  label: string;
  value: BigNumber;
  decimals: number;
  symbol: string;
  emptyState?: boolean;
  emptyStatePlaceHolder?: string;
};

export default function LabelAndAsset({
  label,
  value,
  symbol,
  decimals,
  emptyState = false,
  emptyStatePlaceHolder = '',
}: LabelAndAssetProps) {
  return (
    <LabelAndValue
      label={label}
      value={
        emptyState ? (
          emptyStatePlaceHolder
        ) : (
          <Amount symbol={symbol} value={value} decimals={decimals} />
        )
      }
    />
  );
}
