import { Operation } from '../features/operations/state/types';

const WRAP = '/wrap';
const WRAP_FINALIZE = '/wrap/:transactionHash';
const UNWRAP_FINALIZE = '/unwrap/:transactionHash';
const UNWRAP = '/unwrap';

const HISTORY_WRAP = '/history/wrap';
const HISTORY_UNWRAP = '/history/unwrap';
const HISTORY = '/history';

export const paths = {
  WRAP,
  UNWRAP,
  WRAP_FINALIZE,
  UNWRAP_FINALIZE,
  HISTORY_WRAP,
  HISTORY_UNWRAP,
  HISTORY
};

export const mainPaths = ['/', WRAP, UNWRAP, WRAP_FINALIZE, UNWRAP_FINALIZE];

export const historyPaths = [HISTORY, HISTORY_WRAP, HISTORY_UNWRAP];


export const wrapPage = (op: Operation) => `/wrap/${op.hash}`;
export const unwrapPage = (op: Operation) => `/unwrap/${op.hash}`;
