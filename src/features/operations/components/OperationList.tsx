import { Divider, List } from '@material-ui/core';
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

export default function OperationList() {
  const operations = useRecoilValue(operationsState);
  const {
    tezos: { status },
  } = useWalletContext();
  const { mintErc20 } = usePendingOperationsActions();
  const { fungibleTokens, wrapSignatureThreshold } = useConfig();

  const renderOp = (op: Operation, isLast: boolean) => {
    if (op.status.type === StatusType.DONE) {
      return;
    }
    switch (op.type) {
      case OperationType.WRAP:
        return (
          <React.Fragment key={op.transactionHash}>
            <Mint
              fungibleTokens={fungibleTokens}
              operation={op}
              connected={status === ConnectionStatus.CONNECTED}
              requiredSignatures={wrapSignatureThreshold}
              onMint={() => mintErc20(op).then(() => {})}
            />
            {!isLast && <Divider />}
          </React.Fragment>
        );
    }
  };

  return (
    <List>
      {operations.map((op, i) => renderOp(op, i === operations.length - 1))}
    </List>
  );
}
