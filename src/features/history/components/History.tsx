import React from 'react';
import { PaperContent } from '../../../components/paper/Paper';
import { AllOperationsHistoryState } from '../../operations/hooks/useAllOperationsHistory';

export type HistoryProps = {
  operations: AllOperationsHistoryState;
  canFetch: boolean;
};

export default function History({ operations, canFetch }: HistoryProps) {
  return (
    <>
      <PaperContent>
        <h1>Past Transaction History</h1>
      </PaperContent>

      <PaperContent>
        <div>
          {!canFetch && <span>Connect at least one of your wallet</span>}
          {canFetch && (
            <>
              {operations.mints.map((mint) => (
                <div key={mint.transactionHash}>{mint.transactionHash}</div>
              ))}
              {operations.burns.map((burn) => (
                <div key={burn.operationHash}>{burn.operationHash}</div>
              ))}
            </>
          )}
        </div>
      </PaperContent>
      <PaperContent>
        <div>faux transaction</div>
      </PaperContent>
    </>
  );
}
