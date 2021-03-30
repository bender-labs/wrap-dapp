import { StatusType, WrapOperation } from '../state/types';
import { TokenMetadata } from '../../swap/token';
import {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import { formatAmount } from '../../ethereum/token';
import { ellipsizeAddress } from '../../wallet/address';
import LoadableButton from '../../../components/button/LoadableButton';

export type MintProps = {
  operation: WrapOperation;
  fungibleTokens: Record<string, TokenMetadata>;
  requiredSignatures: number;
  onMint: () => Promise<void>;
};

export default function Mint({
  operation,
  fungibleTokens,
  requiredSignatures,
  onMint,
}: MintProps) {
  const [loading, setLoading] = useState(false);

  const tokensByEthAddress = useMemo(
    () =>
      Object.entries(fungibleTokens).reduce<Record<string, TokenMetadata>>(
        (acc, [, metadata]) => {
          acc[metadata.ethereumContractAddress] = metadata;
          return acc;
        },
        {}
      ),
    [fungibleTokens]
  );

  const erc20PrimaryText = () => {
    const { decimals, ethereumSymbol } = tokensByEthAddress[
      operation.token.toLowerCase()
    ];
    return `mint ${formatAmount(
      ethereumSymbol,
      operation.amount.minus(operation.fees),
      decimals
    )} to ${ellipsizeAddress(operation.destination)}`;
  };

  const erc20SecondaryText = () => {
    switch (operation.status.type) {
      case StatusType.NEW:
        return 'Waiting for operation to be included';
      case StatusType.WAITING_FOR_CONFIRMATIONS:
        return `Pending... (${operation.status.confirmations}/${operation.status.confirmationsThreshold} confirmations)`;
      case StatusType.WAITING_FOR_SIGNATURES:
        return (
          <React.Fragment>
            <Typography component="p" variant={'caption'}>
              Waiting for signatures
            </Typography>
            <Typography component="p" variant={'caption'}>
              {`(${
                Object.keys(operation.status.signatures).length
              }/${requiredSignatures} signatures received)`}
            </Typography>
          </React.Fragment>
        );
      case StatusType.READY:
        return 'Ready to mint';
    }
  };

  const disabled = operation.status.type !== StatusType.READY;

  const handleMint = async () => {
    setLoading(true);
    await onMint();
    setLoading(false);
  };
  return (
    <ListItem>
      <ListItemText
        primary={erc20PrimaryText()}
        secondary={erc20SecondaryText()}
      />
      <ListItemSecondaryAction>
        <LoadableButton
          loading={loading}
          onClick={handleMint}
          disabled={disabled}
          text={'MINT'}
          color={'primary'}
          variant={'outlined'}
          size={'small'}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
}
