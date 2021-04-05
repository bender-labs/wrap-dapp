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
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { SpacedDivider } from '../../../components/formatting/SpacedDivider';
import LabelAndAsset from '../../../components/formatting/LabelAndAsset';
import AssetSummary from '../../../components/formatting/AssetSummary';
import LabelAndValue from '../../../components/formatting/LabelAndValue';
import { UnwrapStatus } from '../hooks/useUnwrap';
import UnwrapActions from './UnwrapActions';

export type UnwrapConfirmStepProps = {
  token: TokenMetadata;
  fees: Fees;
  sendingAddress: string;
  recipientAddress: string;
  amount: BigNumber;
  onPrevious: () => void;
  status: UnwrapStatus;
  onUnwrap: () => void;
};

export default function UnwrapConfirmStep({
  onPrevious,
  amount,
  fees,
  token,
  status,
  sendingAddress,
  recipientAddress,
  onUnwrap,
}: UnwrapConfirmStepProps) {
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
          symbol={token.ethereumSymbol}
        />
      </PaperContent>
      <SpacedDivider />
      <PaperContent>
        <UnwrapActions onUnwrap={onUnwrap} status={status} />
      </PaperContent>
    </>
  );
}
