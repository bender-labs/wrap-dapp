import React from 'react';
import BigNumber from 'bignumber.js';
import { formatOptions } from './numberFormat';
import NumberFormat from 'react-number-format';
import LabelAndValue from './LabelAndValue';

export type LabelAndAssetProps = {
  label: string;
  value: BigNumber;
  decimals: number;
  symbol: string;
};

export default function LabelAndAsset({
  label,
  value,
  symbol,
  decimals,
}: LabelAndAssetProps) {
  return (
    <LabelAndValue
      label={label}
      value={
        <NumberFormat
          displayType="text"
          suffix={` ${symbol}`}
          {...formatOptions}
          value={value.shiftedBy(-decimals).toString()}
        />
      }
    />
  );
}
