import { Operation } from '../features/operations/state/types';

const WRAP = '/wrap';
const WRAP_FINALIZE = '/wrap/:transactionHash';
const UNWRAP_FINALIZE = '/unwrap/:transactionHash';
const UNWRAP = '/unwrap';
const HISTORY = '/history';

const HISTORY_WRAP = '/history/wrap';
const HISTORY_UNWRAP = '/history/unwrap';

export const paths = {
  WRAP,
  UNWRAP,
  WRAP_FINALIZE,
  UNWRAP_FINALIZE,
  HISTORY,
  HISTORY_WRAP,
  HISTORY_UNWRAP
};

export const mainPaths = ['/', WRAP, UNWRAP, WRAP_FINALIZE, UNWRAP_FINALIZE];

export const wrapPage = (op: Operation) => `/wrap/${op.hash}`;
export const unwrapPage = (op: Operation) => `/unwrap/${op.hash}`;
