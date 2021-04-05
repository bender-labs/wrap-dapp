import { Operation } from '../features/operations/state/types';

const WRAP = '/wrap';
const WRAP_FINALIZE = '/wrap/:transactionHash';
const UNWRAP_FINALIZE = '/unwrap/:transactionHash';
const UNWRAP = '/unwrap';

export const paths = {
  WRAP,
  UNWRAP,
  WRAP_FINALIZE,
  UNWRAP_FINALIZE,
};

export const wrapPage = (op: Operation) => `/wrap/${op.hash}`;
export const unwrapPage = (op: Operation) => `/unwrap/${op.hash}`;
