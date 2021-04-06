import { initialState, reducer, WrapAction, WrapStatus } from './useWrap';
import BigNumber from 'bignumber.js';

test('Should transition to not ready on token select', () => {
  const state = {
    ...initialState('tok', '0x'),
    status: WrapStatus.READY_TO_CONFIRM,
    currentBalance: new BigNumber(10),
    currentAllowance: new BigNumber(10),
    amountToWrap: new BigNumber(10),
  };

  const newState = reducer(state, {
    type: WrapAction.TOKEN_SELECT,
    payload: { token: 'aToken' },
  });

  expect(newState.status).toEqual(WrapStatus.NOT_READY);
  expect(newState.currentBalance).toEqual(new BigNumber(0));
  expect(newState.currentAllowance).toEqual(new BigNumber(0));
  expect(newState.amountToWrap).toEqual(new BigNumber(0));
  expect(newState.token).toEqual('aToken');
});

test('Should transition to ready to confirm', () => {
  const state = {
    ...initialState('tok', '0x'),
    status: WrapStatus.READY_TO_CONFIRM,
    currentBalance: new BigNumber(10),
    connected: true,
  };

  const newState = reducer(state, {
    type: WrapAction.AMOUNT_TO_WRAP_CHANGE,
    payload: { amountToWrap: new BigNumber(10) },
  });

  expect(newState.status).toEqual(WrapStatus.READY_TO_CONFIRM);
});

test('Should not transition to ready to confirm if not connected', () => {
  const state = {
    ...initialState('tok', '0x'),
    status: WrapStatus.READY_TO_CONFIRM,
    currentBalance: new BigNumber(10),
    connected: false,
  };

  const newState = reducer(state, {
    type: WrapAction.AMOUNT_TO_WRAP_CHANGE,
    payload: { amountToWrap: new BigNumber(10) },
  });

  expect(newState.status).toEqual(WrapStatus.NOT_READY);
});

test('Should not transition to ready to confirm if 0 amount', () => {
  const state = {
    ...initialState('tok', '0x'),
    status: WrapStatus.NOT_READY,
    connected: true,
  };

  const newState = reducer(state, {
    type: WrapAction.AMOUNT_TO_WRAP_CHANGE,
    payload: { amountToWrap: new BigNumber(0) },
  });

  expect(newState.status).toEqual(WrapStatus.NOT_READY);
});

test('Should not transition to ready if amount greater than balance', () => {
  const state = {
    ...initialState('tok', '0x'),
    status: WrapStatus.NOT_READY,
    connected: true,
  };

  const newState = reducer(state, {
    type: WrapAction.AMOUNT_TO_WRAP_CHANGE,
    payload: { amountToWrap: new BigNumber(10) },
  });

  expect(newState.status).toEqual(WrapStatus.NOT_READY);
});

test('Should not transition to ready if amount is not a number', () => {
  const state = {
    ...initialState('tok', '0x'),
    status: WrapStatus.NOT_READY,
    connected: true,
  };

  const newState = reducer(state, {
    type: WrapAction.AMOUNT_TO_WRAP_CHANGE,
    payload: { amountToWrap: new BigNumber('') },
  });

  expect(newState.status).toEqual(WrapStatus.NOT_READY);
});

export {};
