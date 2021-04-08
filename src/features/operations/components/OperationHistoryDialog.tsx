import OperationHistoryButton from '../../../components/button/OperationHistoryButton';
import { useOperationsHistory } from '../hooks/useOperationsHistory';
import React, { ReactNode, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Operation,
  OperationStatusType,
  UnwrapErc20Operation,
  WrapErc20Operation,
} from '../state/types';
import { formatAmount } from '../../ethereum/token';
import { ellipsizeAddress } from '../../wallet/address';
import { TokenMetadata } from '../../swap/token';
import { useConfig } from '../../../runtime/config/ConfigContext';
import { PaperContent } from '../../../components/paper/Paper';

const useStyle = makeStyles((theme) => ({
  subHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

export default function OperationHistoryDialog() {
  const classes = useStyle();
  const {
    operations,
    count,
    canFetch,
    selectOperation,
  } = useOperationsHistory();
  const [open, setOpen] = useState(false);
  const {
    fungibleTokens,
    wrapSignatureThreshold,
    unwrapSignatureThreshold,
  } = useConfig();

  const gotoOp = (op: Operation) => {
    selectOperation(op);
    setOpen(false);
  };

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

  const renderItem = (
    operation: Operation,
    primary: string,
    secondary: string | ReactNode,
    isLast: boolean
  ) => {
    return (
      <React.Fragment key={operation.hash}>
        <ListItem
          button
          onClick={(e) => {
            e.preventDefault();
            gotoOp(operation);
          }}
        >
          <ListItemText primary={primary} secondary={secondary} />
        </ListItem>
        {!isLast && <Divider />}
      </React.Fragment>
    );
  };

  const renderMint = (operation: WrapErc20Operation, isLast: boolean) => {
    const primaryText = () => {
      const { decimals, ethereumSymbol } = tokensByEthAddress[
        operation.token.toLowerCase()
      ];
      return `mint ${formatAmount(
        ethereumSymbol,
        operation.amount.minus(operation.fees),
        decimals
      )} to ${ellipsizeAddress(operation.destination)}`;
    };

    const secondaryText = () => {
      switch (operation.status.type) {
        case OperationStatusType.NEW:
          return 'Waiting for operation to be included';
        case OperationStatusType.WAITING_FOR_CONFIRMATIONS:
          return `Pending... (${operation.status.confirmations}/${operation.status.confirmationsThreshold} confirmations)`;
        case OperationStatusType.WAITING_FOR_SIGNATURES:
          return (
            <React.Fragment>
              <Typography component="p" variant={'caption'}>
                Waiting for signatures
              </Typography>
              <Typography component="p" variant={'caption'}>
                {`(${
                  Object.keys(operation.status.signatures).length
                }/${wrapSignatureThreshold} signatures received)`}
              </Typography>
            </React.Fragment>
          );
        case OperationStatusType.READY:
          return 'Ready to mint';
      }
    };

    return renderItem(operation, primaryText(), secondaryText(), isLast);
  };

  const renderBurn = (operation: UnwrapErc20Operation, isLast: boolean) => {
    const primaryText = () => {
      const { decimals, ethereumSymbol } = tokensByEthAddress[
        operation.token.toLowerCase()
      ];
      return `release ${formatAmount(
        ethereumSymbol,
        operation.amount.minus(operation.fees),
        decimals
      )} to ${ellipsizeAddress(operation.destination)}`;
    };

    const secondaryText = () => {
      switch (operation.status.type) {
        case OperationStatusType.NEW:
          return 'Waiting for operation to be included';
        case OperationStatusType.WAITING_FOR_CONFIRMATIONS:
          return `Pending... (${operation.status.confirmations}/${operation.status.confirmationsThreshold} confirmations)`;
        case OperationStatusType.WAITING_FOR_SIGNATURES:
          return (
            <React.Fragment>
              <Typography component="p" variant={'caption'}>
                Waiting for signatures
              </Typography>
              <Typography component="p" variant={'caption'}>
                {`(${
                  Object.keys(operation.status.signatures).length
                }/${unwrapSignatureThreshold} signatures received)`}
              </Typography>
            </React.Fragment>
          );
        case OperationStatusType.READY:
          return 'Ready to release';
      }
    };

    return renderItem(operation, primaryText(), secondaryText(), isLast);
  };

  return (
    <>
      <OperationHistoryButton
        count={count}
        onClick={() => {
          setOpen(!open);
        }}
      />
      <Dialog open={open} onBackdropClick={() => setOpen(false)} fullWidth>
        <DialogTitle>Pending operations</DialogTitle>
        {!canFetch && (
          <PaperContent>
            <Typography variant={'body1'}>
              Please connect to at least one wallet to see your pending
              operations
            </Typography>
          </PaperContent>
        )}
        {canFetch && (
          <List>
            <ListSubheader className={classes.subHeader}>
              Minting operations
            </ListSubheader>
            {operations.mints.map((o, i) =>
              renderMint(o, i === operations.mints.length - 1)
            )}
            {operations.mints.length === 0 && (
              <ListItem>
                <ListItemText>No pending minting operation</ListItemText>
              </ListItem>
            )}
            <Divider />
            <ListSubheader className={classes.subHeader}>
              Release operations
            </ListSubheader>
            {operations.burns.map((o, i) =>
              renderBurn(o, i === operations.burns.length - 1)
            )}
            {operations.burns.length === 0 && (
              <ListItem>
                <ListItemText>No pending release operation</ListItemText>
              </ListItem>
            )}
          </List>
        )}
      </Dialog>
    </>
  );
}
