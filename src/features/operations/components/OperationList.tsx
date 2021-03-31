import { Divider, List, ListSubheader } from '@material-ui/core';
import React from 'react';
import {
  operationsState,
  usePendingOperationsActions,
} from '../state/pendingOperations';
import { useConfig } from '../../../runtime/config/ConfigContext';
import { Operation, OperationType, StatusType } from '../state/types';
import Mint from './Mint';
import { useRecoilValue } from 'recoil';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import { ConnectionStatus } from '../../wallet/connectionStatus';
import Burn from './Burn';
import { makeStyles } from '@material-ui/core/styles';

const useStyle = makeStyles((theme) => ({
  subHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

export default function OperationList() {
  const classes = useStyle();
  const { mints, burns } = useRecoilValue(operationsState);
  const {
    tezos: { status: tezosStatus },
    ethereum: { status: ethStatus },
  } = useWalletContext();
  const { mintErc20, unlockErc20 } = usePendingOperationsActions();
  const { fungibleTokens, wrapSignatureThreshold } = useConfig();

  const renderOp = (op: Operation, isLast: boolean) => {
    if (op.status.type === StatusType.DONE) {
      return;
    }
    switch (op.type) {
      case OperationType.WRAP:
        return (
          <React.Fragment key={op.hash}>
            <Mint
              fungibleTokens={fungibleTokens}
              operation={op}
              connected={tezosStatus === ConnectionStatus.CONNECTED}
              requiredSignatures={wrapSignatureThreshold}
              onMint={() => mintErc20(op).then(() => {})}
            />
            {!isLast && <Divider />}
          </React.Fragment>
        );
      case OperationType.UNWRAP:
        return (
          <React.Fragment key={op.hash}>
            <Burn
              fungibleTokens={fungibleTokens}
              operation={op}
              connected={ethStatus === ConnectionStatus.CONNECTED}
              requiredSignatures={wrapSignatureThreshold}
              onBurn={() => unlockErc20(op).then(() => {})}
            />
            {!isLast && <Divider />}
          </React.Fragment>
        );
    }
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
