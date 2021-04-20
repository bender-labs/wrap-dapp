import { useParams } from 'react-router-dom';
import { useOperation } from '../features/operations/hooks/useOperation';
import { OperationType } from '../features/operations/state/types';
import WrapReceipt from '../features/wrap/components/WrapReceipt';
import React from 'react';
import UnwrapReceipt from '../features/unwrap/components/UnwrapReceipt';
import { useRecoilValue } from 'recoil';
import { operationByHashState } from '../features/operations/state/pendingOperations';

export type OperationScreenProps = {
  type: OperationType;
};

export default function OperationScreen({ type }: OperationScreenProps) {
  const { transactionHash } = useParams() as { transactionHash: string };
  const maybeOperation = useRecoilValue(operationByHashState(transactionHash));
  const {
    state,
    fungibleTokens,
    mintErc20,
    unlockErc20,
    signaturesThreshold: {
      wrap: wrapSignaturesThreshold,
      unwrap: unwrapSignaturesThreshold,
    },
  } = useOperation(maybeOperation || transactionHash, type);
  const { operation, status, tzStatus, ethStatus } = state;
  if (!operation) {
    return <div>Loading</div>;
  }
  switch (operation?.type) {
    case OperationType.WRAP:
      return (
        <WrapReceipt
          status={status}
          signaturesThreshold={wrapSignaturesThreshold}
          walletStatus={tzStatus}
          operation={operation}
          tokens={fungibleTokens}
          onMint={() => mintErc20()}
        />
      );
    case OperationType.UNWRAP:
      return (
        <UnwrapReceipt
          status={status}
          walletStatus={ethStatus}
          operation={operation}
          tokens={fungibleTokens}
          onRelease={() => unlockErc20().then(() => {})}
        />
      );
  }
}
