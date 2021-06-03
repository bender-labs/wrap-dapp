import {Operation} from '../features/operations/state/types';

const WRAP = '/wrap';
const WRAP_FINALIZE = '/wrap/:transactionHash';
const UNWRAP_FINALIZE = '/unwrap/:transactionHash';
const UNWRAP = '/unwrap';

const HISTORY_WRAP = '/history/wrap';
const HISTORY_UNWRAP = '/history/unwrap';
const HISTORY = '/history';

const FARMING = '/farming';
const farmingContract = '/:contract';
const FARMING_STAKE_ALL = `${FARMING}/stake_all`;
const FARMING_STAKE = `${FARMING}${farmingContract}/stake`;
const FARMING_UNSTAKE = `${FARMING}${farmingContract}/unstake`;
const FARMING_CLAIM = `${FARMING}${farmingContract}/claim`;

export const paths = {
    WRAP,
    UNWRAP,
    WRAP_FINALIZE,
    UNWRAP_FINALIZE,
    HISTORY_WRAP,
    HISTORY_UNWRAP,
    HISTORY,
    FARMING,
    FARMING_STAKE_ALL,
    FARMING_STAKE,
    FARMING_UNSTAKE,
    FARMING_CLAIM
};

export const mainPaths = ['/', WRAP, UNWRAP, WRAP_FINALIZE, UNWRAP_FINALIZE];
export const historyPaths = [HISTORY, HISTORY_WRAP, HISTORY_UNWRAP];
export const farmingPaths = [FARMING_STAKE, FARMING_UNSTAKE, FARMING_CLAIM];

export const wrapPage = (op: Operation) => `/wrap/${op.hash}`;
export const unwrapPage = (op: Operation) => `/unwrap/${op.hash}`;
export const farmPageRoute = (farmContract: string) => FARMING_STAKE.replace(':contract', farmContract);