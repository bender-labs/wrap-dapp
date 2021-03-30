import { Divider, List } from '@material-ui/core';
import React from 'react';
import {
  operationsState,
  usePendingOperationsActions,
} from '../state/pendingOperations';
import { useConfig } from '../../../runtime/config/ConfigContext';
import { Operation, OperationType } from '../state/types';
import Mint from './Mint';
import { useRecoilValue } from 'recoil';

export default function OperationList() {
  const operations = useRecoilValue(operationsState);
  const { mintErc20 } = usePendingOperationsActions();
  const { fungibleTokens, wrapSignatureThreshold } = useConfig();

  const renderOp = (op: Operation) => {
    switch (op.type) {
      case OperationType.WRAP:
        return (
          <React.Fragment key={op.transactionHash}>
            <Mint
              fungibleTokens={fungibleTokens}
              operation={op}
              requiredSignatures={wrapSignatureThreshold}
              onMint={() => mintErc20(op).then(() => {})}
            />
            <Divider />
          </React.Fragment>
        );
    }
  };

  return <List>{operations.map(renderOp)}</List>;
}
