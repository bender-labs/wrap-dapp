import { PaperContent } from '../../../components/paper/Paper';
import { Button } from '@material-ui/core';
import React from 'react';
import AssetSummary from '../../../components/formatting/AssetSummary';
import BigNumber from 'bignumber.js';
import { TokenMetadata } from '../../swap/token';
import { wrapFees } from '../../fees/fees';
import { Fees } from '../../../config';
import WrapActions from './WrapActions';
import { WrapStatus } from '../hooks/useWrap';

export type WrapConfirmStepProps = {
  token: TokenMetadata;
  fees: Fees;
  amount: BigNumber;
  onPrevious: () => void;
  status: WrapStatus;
  currentAllowance: BigNumber;
  onAuthorize: () => void;
  onWrap: () => void;
};

export default function WrapConfirmStep({
  onPrevious,
  amount,
  fees,
  token,
  status,
  currentAllowance,
  onAuthorize,
  onWrap,
}: WrapConfirmStepProps) {
  const currentFees = wrapFees(amount, fees);
  return (
    <>
      <Button onClick={onPrevious}>Back</Button>
      <PaperContent>
        <AssetSummary
          label={'Receive'}
          decimals={token.decimals}
          value={amount.minus(currentFees)}
          symbol={token.tezosSymbol}
        />
        <AssetSummary
          label={'Fees'}
          decimals={token.decimals}
          value={currentFees}
          symbol={token.tezosSymbol}
        />
        <WrapActions
          currentAllowance={currentAllowance}
          amountToWrap={amount}
          decimals={token.decimals}
          onAuthorize={onAuthorize}
          onWrap={onWrap}
          status={status}
          token={token.tezosSymbol}
        />
      </PaperContent>
    </>
  );
}
