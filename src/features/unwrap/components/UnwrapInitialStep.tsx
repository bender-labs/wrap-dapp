import BigNumber from 'bignumber.js';
import { TokenMetadata } from '../../swap/token';
import { Fees } from '../../../config';
import { UnwrapStatus } from '../hooks/useUnwrap';
import React, { useEffect, useState } from 'react';
import { wrapFees } from '../../fees/fees';
import { PaperContent } from '../../../components/paper/Paper';
import TokenSelection from '../../../components/token/TokenSelection';
import { SupportedBlockchain } from '../../wallet/blockchain';
import AmountToWrapInput from '../../../components/token/AmountToWrapInput';
import { SpacedDivider } from '../../../components/formatting/SpacedDivider';
import AssetSummary from '../../../components/formatting/AssetSummary';
import { Button } from '@material-ui/core';
import MultiConnect from '../../wallet/MultiConnect';

export type UnwrapInitialStepProps = {
  status: UnwrapStatus;
  balance: BigNumber;
  token: TokenMetadata;
  connected: boolean;
  amount: BigNumber;
  fees: Fees;
  onAmountChange: (v: BigNumber) => void;
  onTokenChange: (t: string) => void;
  tokens: Record<string, TokenMetadata>;
  onNext: () => void;
};

export default function UnwrapInitialStep({
  amount,
  balance,
  connected,
  fees,
  onAmountChange,
  onNext,
  onTokenChange,
  status,
  token,
  tokens,
}: UnwrapInitialStepProps) {
  const [currentFees, setCurrentFees] = useState(new BigNumber(0));

  useEffect(() => setCurrentFees(wrapFees(amount, fees)), [amount, fees]);

  return (
    <>
      <PaperContent>
        <TokenSelection
          token={token.ethereumSymbol}
          onTokenSelect={onTokenChange}
          blockchainTarget={SupportedBlockchain.Tezos}
          tokens={tokens}
        />
        <AmountToWrapInput
          balance={balance}
          decimals={token.decimals}
          symbol={token.tezosSymbol}
          onChange={onAmountChange}
          amountToWrap={amount}
          displayBalance={connected}
        />
      </PaperContent>
      <SpacedDivider />
      <PaperContent>
        <AssetSummary
          label={'You will receive'}
          value={amount.minus(currentFees)}
          symbol={token.ethereumSymbol}
          decimals={token.decimals}
        />
      </PaperContent>
      <SpacedDivider />
      <PaperContent>
        {connected && (
          <Button
            fullWidth
            variant={'contained'}
            color={'primary'}
            onClick={onNext}
            disabled={status < UnwrapStatus.AMOUNT_TO_WRAP_SELECTED}
          >
            NEXT
          </Button>
        )}
        {!connected && <MultiConnect />}
      </PaperContent>
    </>
  );
}
