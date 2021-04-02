import { StatusType, WrapErc20Operation } from '../../operations/state/types';
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from '../../../components/paper/Paper';
import React, { useMemo, useState } from 'react';
import LabelAndValue from '../../../components/formatting/LabelAndValue';
import { CircularProgressWithLabel } from '../../../components/progress/CircularProgressWithLabel';
import LabelAndAsset from '../../../components/formatting/LabelAndAsset';
import { TokenMetadata } from '../../swap/token';
import { Button, Typography } from '@material-ui/core';
import { SpacedDivider } from '../../../components/formatting/SpacedDivider';
import LoadableButton from '../../../components/button/LoadableButton';

export type WrapReceiptProps = {
  operation: WrapErc20Operation;
  tokens: Record<string, TokenMetadata>;
  onMint: () => Promise<void>;
};

function label(value: string) {
  return (
    <Typography variant="caption" component="div" color="textSecondary">
      {value}
    </Typography>
  );
}

function wrapStatus(
  operation: WrapErc20Operation,
  confirmations: number,
  signatures: number,
  onMint: () => any,
  loading: boolean
) {
  const step = 100 / (confirmations + signatures + 2);
  switch (operation.status.type) {
    case StatusType.WAITING_FOR_RECEIPT:
      return (
        <CircularProgressWithLabel
          label={label('Waiting to be included')}
          value={step}
        />
      );
    case StatusType.NEW:
      return (
        <CircularProgressWithLabel
          label={label('Waiting for indexer')}
          value={step * 2}
        />
      );
    case StatusType.WAITING_FOR_CONFIRMATIONS:
      const value = step * 2 + step * operation.status.confirmations;
      return (
        <CircularProgressWithLabel
          label={label(
            `Waiting for confirmations. (${operation.status.confirmations}/${operation.status.confirmationsThreshold})`
          )}
          value={value}
        />
      );
    case StatusType.WAITING_FOR_SIGNATURES:
      const signaturesCount = Object.keys(operation.status.signatures).length;
      const sigValue = step * 2 + step * confirmations + step * signaturesCount;
      return (
        <CircularProgressWithLabel
          label={label(
            `Waiting for signatures. ${signaturesCount}/${signatures}`
          )}
          value={sigValue}
        />
      );
    case StatusType.READY:
      return (
        <PaperContent>
          <LoadableButton
            variant={'contained'}
            color={'primary'}
            disabled={false}
            loading={loading}
            onClick={onMint}
            text={'MINT'}
          />
        </PaperContent>
      );

    case StatusType.DONE:
      return (
        <PaperContent>
          <Button
            variant={'outlined'}
            color={'primary'}
            disabled={true}
            fullWidth
          >
            Applied
          </Button>
        </PaperContent>
      );
  }
}

export default function WrapReceipt({
  operation,
  tokens,
  onMint,
}: WrapReceiptProps) {
  const tokensByEthAddress = useMemo(
    () =>
      Object.entries(tokens).reduce<Record<string, TokenMetadata>>(
        (acc, [, metadata]) => {
          acc[metadata.ethereumContractAddress] = metadata;
          return acc;
        },
        {}
      ),
    [tokens]
  );

  const [loading, setLoading] = useState(false);

  const doMint = async () => {
    setLoading(true);
    await onMint();
    setLoading(false);
  };

  const { decimals, tezosSymbol } = tokensByEthAddress[
    operation.token.toLowerCase()
  ];
  return (
    <>
      <PaperHeader>
        <PaperNav />
        <PaperTitle>Minting</PaperTitle>
        <PaperActions />
      </PaperHeader>
      <PaperContent>
        <LabelAndValue
          label={'Recipient address'}
          value={operation.destination}
        />
        <LabelAndAsset
          label={'Receive'}
          value={operation.amount.minus(operation.fees)}
          symbol={tezosSymbol}
          decimals={decimals}
        />
        <LabelAndAsset
          label={'Protocol fees'}
          value={operation.fees}
          symbol={tezosSymbol}
          decimals={decimals}
        />
      </PaperContent>
      <SpacedDivider />
      {wrapStatus(operation, 10, 2, doMint, loading)}
    </>
  );
}
