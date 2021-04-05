import { useParams } from 'react-router-dom';
import { useOperation } from '../features/operations/hooks/useOperation';
import { usePendingOperationsActions } from '../features/operations/state/pendingOperations';
import { OperationType } from '../features/operations/state/types';
import WrapReceipt from '../features/wrap/components/WrapReceipt';
import React from 'react';

export default function OperationScreen() {
  const { transactionHash } = useParams() as { transactionHash: string };
  const { operation, fungibleTokens } = useOperation(transactionHash);
  const { mintErc20 } = usePendingOperationsActions();
  if (!operation) {
    return <div>Loading</div>;
  }
  if (operation?.type === OperationType.WRAP) {
    return (
      <WrapReceipt
        operation={operation}
        tokens={fungibleTokens}
        onMint={() => mintErc20(operation).then(() => {})}
      />
    );
  }
  return <></>;
}
