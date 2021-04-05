import { useParams } from 'react-router-dom';
import { useOperation } from '../features/operations/hooks/useOperation';
import { OperationType } from '../features/operations/state/types';
import WrapReceipt from '../features/wrap/components/WrapReceipt';
import React from 'react';
import UnwrapReceipt from '../features/unwrap/components/UnwrapReceipt';

export type OperationScreenType = {
  type: OperationType;
};

export default function OperationScreen({ type }: OperationScreenType) {
  const { transactionHash } = useParams() as { transactionHash: string };
  const { operation, fungibleTokens, mintErc20, unlockErc20 } = useOperation(
    transactionHash,
    type
  );
  if (!operation) {
    return <div>Loading</div>;
  }
  switch (operation?.type) {
    case OperationType.WRAP:
      return (
        <WrapReceipt
          operation={operation}
          tokens={fungibleTokens}
          onMint={() => mintErc20(operation).then(() => {})}
        />
      );
    case OperationType.UNWRAP:
      return (
        <UnwrapReceipt
          operation={operation}
          tokens={fungibleTokens}
          onRelease={() => unlockErc20(operation).then(() => {})}
        />
      );
  }
}
