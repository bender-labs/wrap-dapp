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
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import LabelAndAsset from '../../../components/formatting/LabelAndAsset';
import AssetSummary from '../../../components/formatting/AssetSummary';
import LabelAndValue from '../../../components/formatting/LabelAndValue';
import { WrapStatus } from '../hooks/reducer';

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
  networkFees: BigNumber;
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
  networkFees,
}: WrapConfirmStepProps) {
  const currentFees = wrapFees(amount, fees);
  return (
    <>
      <PaperHeader
        style={{
          backgroundColor: '#E5E5E5',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: 'inset 0 -7px 9px -7px rgba(0,0,0,0.4)',
        }}
      >
        <PaperNav>
          <IconButton onClick={onPrevious}>
            <ArrowBackIcon />
          </IconButton>
        </PaperNav>
        <PaperTitle>Confirm</PaperTitle>
        <PaperActions />
      </PaperHeader>

      <PaperContent>
        <Typography
          variant={'body2'}
          style={{ paddingLeft: '20px', fontWeight: 'bold' }}
        >
          Details
        </Typography>
        <LabelAndAsset
          label={'Send'}
          decimals={token.decimals}
          value={amount}
          symbol={token.ethereumSymbol}
        />
        <LabelAndValue label={'From'} value={sendingAddress} />
        <LabelAndValue label={'To'} value={recipientAddress} />
      </PaperContent>
      <PaperContent style={{ backgroundColor: '#C4C4C4' }}>
        <Typography
          variant={'body2'}
          style={{ paddingLeft: '20px', fontWeight: 'bold' }}
        >
          Fees
        </Typography>
        <LabelAndAsset
          label={'Wrap fees'}
          decimals={token.decimals}
          value={currentFees}
          symbol={token.tezosSymbol}
        />
        <LabelAndAsset
          label={'Network fees (est.)'}
          decimals={18}
          value={networkFees}
          symbol={'ETH'}
          emptyState={networkFees.lte(0)}
          emptyStatePlaceHolder={'Awaiting for allowance'}
        />
      </PaperContent>

      <PaperContent style={{ padding: '0' }}>
        <AssetSummary
          label={'You will receive'}
          value={amount.minus(currentFees)}
          decimals={token.decimals}
          symbol={token.tezosSymbol}
        />
      </PaperContent>

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
