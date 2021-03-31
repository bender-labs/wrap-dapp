import {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@material-ui/core';
import LoadableButton from '../../../components/button/LoadableButton';
import React, { useMemo, useState } from 'react';
import { StatusType, UnwrapErc20Operation } from '../state/types';
import { TokenMetadata } from '../../swap/token';
import { formatAmount } from '../../ethereum/token';
import { ellipsizeAddress } from '../../wallet/address';
import EthereumConnectionButton from '../../ethereum/components/EthereumConnectionButton';

export type BurnProps = {
  operation: UnwrapErc20Operation;
  fungibleTokens: Record<string, TokenMetadata>;
  requiredSignatures: number;
  onBurn: () => Promise<void>;
  connected: boolean;
};

export default function Burn({
  operation,
  fungibleTokens,
  requiredSignatures,
  onBurn,
  connected,
}: BurnProps) {
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

  const primaryText = () => {
    const { decimals, ethereumSymbol } = tokensByEthAddress[
      operation.token.toLowerCase()
    ];
    return `unlock ${formatAmount(
      ethereumSymbol,
      operation.amount.minus(operation.fees),
      decimals
    )} to ${ellipsizeAddress(operation.destination)}`;
  };

  const secondaryText = () => {
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
        return 'Ready to unlock';
    }
  };

  const disabled = operation.status.type !== StatusType.READY;

  const handleBurn = async () => {
    setLoading(true);
    await onBurn();
    setLoading(false);
  };

  return (
    <ListItem>
      <ListItemText primary={primaryText()} secondary={secondaryText()} />
      <ListItemSecondaryAction>
        {connected && (
          <LoadableButton
            loading={loading}
            onClick={handleBurn}
            disabled={disabled}
            text={'UNLOCK'}
            color={'primary'}
            variant={'outlined'}
            size={'small'}
          />
        )}
        {!connected && <EthereumConnectionButton />}
      </ListItemSecondaryAction>
    </ListItem>
  );
}
