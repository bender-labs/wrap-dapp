import {
  OperationStatusType,
  WrapErc20Operation,
} from '../../operations/state/types';
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from '../../../components/paper/Paper';
import React, { useMemo } from 'react';
import LabelAndValue from '../../../components/formatting/LabelAndValue';
import { CircularProgressWithLabel } from '../../../components/progress/CircularProgressWithLabel';
import LabelAndAsset from '../../../components/formatting/LabelAndAsset';
import { TokenMetadata } from '../../swap/token';
import { Button, Typography } from '@material-ui/core';
// import { SpacedDivider } from '../../../components/formatting/SpacedDivider';
import LoadableButton from '../../../components/button/LoadableButton';
import { ReceiptStatus } from '../../operations/hooks/useOperation';
import { ConnectionStatus } from '../../wallet/connectionStatus';

export type WrapReceiptProps = {
  operation: WrapErc20Operation;
  status: ReceiptStatus;
  walletStatus: ConnectionStatus;
  signaturesThreshold: number;
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
  signaturesThreshold: number,
  onMint: () => any,
  status: ReceiptStatus,
  walletStatus: ConnectionStatus
) {
  const step = 100 / 4;
  switch (operation.status.type) {
    case OperationStatusType.WAITING_FOR_RECEIPT:
      return (
        <CircularProgressWithLabel
          label={label('Waiting to be included')}
          value={0}
        />
      );
    case OperationStatusType.NEW:
      return (
        <CircularProgressWithLabel
          label={label('Waiting for confirmations')}
          value={step}
        />
      );
    case OperationStatusType.WAITING_FOR_CONFIRMATIONS:
      const value = step * 2;
      return (
        <CircularProgressWithLabel
          label={label(
            `Waiting for confirmations. (${operation.status.confirmations}/${operation.status.confirmationsThreshold})`
          )}
          value={value}
        />
      );
    case OperationStatusType.WAITING_FOR_SIGNATURES:
      const signaturesCount = Object.keys(operation.status.signatures).length;
      const sigValue = step * 3;
      return (
        <CircularProgressWithLabel
          label={label(
            `Waiting for signatures. ${signaturesCount}/${signaturesThreshold}`
          )}
          value={sigValue}
        />
      );
    case OperationStatusType.READY:
      return (
        <PaperContent>
          {walletStatus === ConnectionStatus.CONNECTED && (
            <LoadableButton
              variant={'contained'}
              color={'primary'}
              disabled={false}
              loading={status === ReceiptStatus.WAITING_FOR_APPLY}
              onClick={onMint}
              text={'MINT'}
            />
          )}
        </PaperContent>
      );

    case OperationStatusType.DONE:
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
  status,
  signaturesThreshold,
  walletStatus,
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

  const { decimals, tezosSymbol } = tokensByEthAddress[
    operation.token.toLowerCase()
  ];
  return (
    <>
      <PaperHeader
        style={{
          backgroundColor: '#E5E5E5',
          fontSize: '20px',
          fontWeight: 'bold',
          paddingTop: '20px',
          boxShadow: 'inset 0 -7px 9px -7px rgba(0,0,0,0.4)',
        }}
      >
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
      <PaperContent style={{ color: '#ffffff' }}>
        <div style={{ paddingTop: '10px', borderRadius: '5px' }}>
          {wrapStatus(
            operation,
            signaturesThreshold,
            onMint,
            status,
            walletStatus
          )}
        </div>
      </PaperContent>
      <PaperContent
        style={{ minHeight: '200px', borderRadius: '0 0 10px 10px' }}
      />
    </>
  );
}
