import { Operation } from '../features/operations/state/types';

const WRAP = '/wrap';
const OPERATION_FINALIZE = '/operations/:transactionHash';
const UNWRAP = '/unwrap';
const UNWRAP_FINALIZE = '/unwrap_finalize';

export const paths = {
  WRAP,
  OPERATION_FINALIZE,
  UNWRAP,
  UNWRAP_FINALIZE,
};

export const operationPage = (op: Operation) => `/operations/${op.hash}`;
