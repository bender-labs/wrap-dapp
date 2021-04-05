import { PaperContent } from '../../../components/paper/Paper';
import AmountToWrapInput from '../../../components/token/AmountToWrapInput';
import React, { useEffect, useState } from 'react';
import TokenSelection from '../../../components/token/TokenSelection';
import { SupportedBlockchain } from '../../wallet/blockchain';
import BigNumber from 'bignumber.js';
import { TokenMetadata } from '../../swap/token';
import { Fees } from '../../../config';
import { Button } from '@material-ui/core';
import { wrapFees } from '../../fees/fees';
import AssetSummary from '../../../components/formatting/AssetSummary';
import { WrapStatus } from '../hooks/useWrap';
import { SpacedDivider } from '../../../components/formatting/SpacedDivider';
import MultiConnect from '../../wallet/MultiConnect';

export type WrapInitialStepProps = {
  status: WrapStatus;
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

export default function WrapInitialStep({
  status,
  balance,
  connected,
  onAmountChange,
  token,
  amount,
  onTokenChange,
  tokens,
  fees,
  onNext,
}: WrapInitialStepProps) {
  const [currentFees, setCurrentFees] = useState(new BigNumber(0));

  useEffect(() => setCurrentFees(wrapFees(amount, fees)), [amount, fees]);

  return (
    <>
      <PaperContent>
        <TokenSelection
          token={token.ethereumSymbol}
          onTokenSelect={onTokenChange}
          blockchainTarget={SupportedBlockchain.Ethereum}
          tokens={tokens}
        />
        <AmountToWrapInput
          balance={balance}
          decimals={token.decimals}
          symbol={token.ethereumSymbol}
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
          symbol={token.tezosSymbol}
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
            disabled={status < WrapStatus.AMOUNT_TO_WRAP_SELECTED}
          >
            NEXT
          </Button>
        )}
        {!connected && <MultiConnect />}
      </PaperContent>
    </>
  );
}
