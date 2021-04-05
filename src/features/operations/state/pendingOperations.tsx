import { atomFamily, useRecoilCallback } from 'recoil';
import { Operation } from './types';

export const OperationsCountKey = 'OPERATIONS_COUNT';
export const OperationsByHashStateKey = 'OPERATIONS_BY_HASH';

export const operationByHashState = atomFamily<Operation | undefined, string>({
  key: OperationsByHashStateKey,
  default: undefined,
});

export function usePendingOperationsActions() {
  const addOperation = useRecoilCallback(({ set }) => async (o: Operation) => {
    set(operationByHashState(o.hash), o);
  });

  return { addOperation };
}
