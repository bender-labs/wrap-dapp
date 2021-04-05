import { Divider, List, ListSubheader } from '@material-ui/core';
import React from 'react';
import {
  operationByHashState,
  pendingOperationsState,
  usePendingOperationsActions,
} from '../state/pendingOperations';
import { useConfig } from '../../../runtime/config/ConfigContext';
import {
  OperationType,
  UnwrapErc20Operation,
  WrapErc20Operation,
} from '../state/types';
import Mint from './Mint';
import { useRecoilValue } from 'recoil';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import { ConnectionStatus } from '../../wallet/connectionStatus';
import Burn from './Burn';
import { makeStyles } from '@material-ui/core/styles';
import { TokenMetadata } from '../../swap/token';

const useStyle = makeStyles((theme) => ({
  subHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const MintOrBurn = ({
  id,
  fungibleTokens,
  tezosStatus,
  wrapSignatureThreshold,
  mintErc20,
  unwrapErc20,
}: {
  id: string;
  fungibleTokens: Record<string, TokenMetadata>;
  tezosStatus: ConnectionStatus;
  wrapSignatureThreshold: number;
  mintErc20: (op: WrapErc20Operation) => Promise<string>;
  unwrapErc20: (op: UnwrapErc20Operation) => Promise<string>;
}) => {
  const op = useRecoilValue(operationByHashState(id));
  if (!op) {
    return <></>;
  }
  switch (op.type) {
    case OperationType.WRAP:
      return (
        <Mint
          fungibleTokens={fungibleTokens}
          operation={op}
          connected={tezosStatus === ConnectionStatus.CONNECTED}
          requiredSignatures={wrapSignatureThreshold}
          onMint={() => mintErc20(op).then(() => {})}
        />
      );
    case OperationType.UNWRAP:
      return (
        <Burn
          fungibleTokens={fungibleTokens}
          operation={op}
          connected={tezosStatus === ConnectionStatus.CONNECTED}
          requiredSignatures={wrapSignatureThreshold}
          onBurn={() => unwrapErc20(op).then(() => {})}
        />
      );
  }
};

export default function OperationList() {
  const classes = useStyle();
  const { mints, burns } = useRecoilValue(pendingOperationsState);
  const {
    tezos: { status: tezosStatus },
  } = useWalletContext();
  const { mintErc20, unlockErc20 } = usePendingOperationsActions();
  const { fungibleTokens, wrapSignatureThreshold } = useConfig();

  const renderOp = (op: string, isLast: boolean) => {
    return (
      <React.Fragment key={op}>
        <MintOrBurn
          fungibleTokens={fungibleTokens}
          id={op}
          tezosStatus={tezosStatus}
          wrapSignatureThreshold={wrapSignatureThreshold}
          mintErc20={mintErc20}
          unwrapErc20={unlockErc20}
        />
        {!isLast && <Divider />}
      </React.Fragment>
    );
  };

  return (
    <List>
      <ListSubheader className={classes.subHeader}>
        Minting operations
      </ListSubheader>
      {mints.map((op, i) => renderOp(op, i === mints.length - 1))}
      <Divider />
      <ListSubheader className={classes.subHeader}>
        Unlock operations
      </ListSubheader>
      {burns.map((op, i) => renderOp(op, i === burns.length - 1))}
    </List>
  );
}
