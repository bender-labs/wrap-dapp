import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from '../../../components/paper/Paper';
import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import BigNumber from 'bignumber.js';
import { TokenMetadata } from '../../swap/token';
import { wrapFees } from '../../fees/fees';
import { Fees } from '../../../config';
import WrapActions from './WrapActions';
import { WrapStatus } from '../hooks/useWrap';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { SpacedDivider } from '../../../components/formatting/SpacedDivider';
import LabelAndAsset from '../../../components/formatting/LabelAndAsset';
import AssetSummary from '../../../components/formatting/AssetSummary';
import LabelAndValue from '../../../components/formatting/LabelAndValue';

export type WrapConfirmStepProps = {
  token: TokenMetadata;
  fees: Fees;
  sendingAddress: string;
  recipientAddress: string;
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
  sendingAddress,
  recipientAddress,
  onAuthorize,
  onWrap,
}: WrapConfirmStepProps) {
  const currentFees = wrapFees(amount, fees);
  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton onClick={onPrevious}>
            <ArrowBackIcon />
          </IconButton>
        </PaperNav>
        <PaperTitle>Confirm</PaperTitle>
        <PaperActions />
      </PaperHeader>

      <PaperContent>
        <Typography variant={'body2'}>Details</Typography>
        <LabelAndAsset
          label={'Send'}
          decimals={token.decimals}
          value={amount}
          symbol={token.tezosSymbol}
        />
        <LabelAndValue label={'From'} value={sendingAddress} />
        <LabelAndValue label={'To'} value={recipientAddress} />
        <Typography variant={'body2'}>Fees</Typography>
        <LabelAndAsset
          label={'Wrap fees'}
          decimals={token.decimals}
          value={currentFees}
          symbol={token.tezosSymbol}
        />
        <LabelAndAsset
          label={'Network fees'}
          decimals={token.decimals}
          value={currentFees}
          symbol={token.tezosSymbol}
        />
      </PaperContent>
      <SpacedDivider />
      <PaperContent>
        <AssetSummary
          label={'Receive'}
          value={amount.minus(currentFees)}
          decimals={token.decimals}
          symbol={token.tezosSymbol}
        />
      </PaperContent>
      <SpacedDivider />
      <WrapActions
        currentAllowance={currentAllowance}
        amountToWrap={amount}
        decimals={token.decimals}
        onAuthorize={onAuthorize}
        onWrap={onWrap}
        status={status}
        token={token.ethereumSymbol}
      />
    </>
  );
}
