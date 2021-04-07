import { useCallback, useEffect, useReducer } from 'react';
import {
  TezosUnwrapApi,
  TezosUnwrapApiBuilder,
  TezosUnwrapApiFactory,
} from '../../tezos/TezosUnwrapApi';
import BigNumber from 'bignumber.js';
import { useConfig } from '../../../runtime/config/ConfigContext';
import { Web3Provider } from '@ethersproject/providers';
import { TezosToolkit } from '@taquito/taquito';
import { Fees } from '../../../config';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import {
  OperationType,
  StatusType,
  UnwrapErc20Operation,
} from '../../operations/state/types';
import { unwrapFees } from '../../fees/fees';

export enum UnwrapAction {
  WALLET_CHANGE,
  USER_BALANCE_CHANGE,
  AMOUNT_TO_UNWRAP_CHANGE,
  TOKEN_SELECT,
  RUN_UNWRAP,
}

type UnwrapState = {
  status: UnwrapStatus;
  token: string;
  contract: TezosUnwrapApi | null;
  currentBalance: BigNumber;
  amountToUnwrap: BigNumber;
  connected: boolean;
  minterContractAddress: string;
  fees: Fees;
  contractFactory?: TezosUnwrapApiFactory;
};

export enum UnwrapStatus {
  UNINITIALIZED,
  NOT_READY,
  READY_TO_UNWRAP,
  WAITING_FOR_UNWRAP,
}

type Action =
  | {
      type: UnwrapAction.TOKEN_SELECT;
      payload: { token: string };
    }
  | {
      type: UnwrapAction.USER_BALANCE_CHANGE;
      payload: { currentBalance: BigNumber; contract: TezosUnwrapApi };
    }
  | {
      type: UnwrapAction.AMOUNT_TO_UNWRAP_CHANGE;
      payload: { amountToUnwrap: BigNumber };
    }
  | { type: UnwrapStatus.READY_TO_UNWRAP; payload: {} }
  | {
      type: UnwrapAction.WALLET_CHANGE;
      payload: Partial<{
        tezosAccount: string;
        tezosLibrary: TezosToolkit;
        ethAccount: string;
        ethLibrary: Web3Provider;
      }>;
    }
  | { type: UnwrapAction.RUN_UNWRAP };

const tryReady = (state: UnwrapState): UnwrapState => {
  if (
    !state.connected ||
    state.amountToUnwrap.isZero() ||
    state.amountToUnwrap.isNaN() ||
    state.amountToUnwrap.isGreaterThan(state.currentBalance)
  ) {
    return { ...state, status: UnwrapStatus.NOT_READY };
  }
  return {
    ...state,
    status: state.amountToUnwrap.lte(state.currentBalance)
      ? UnwrapStatus.READY_TO_UNWRAP
      : UnwrapStatus.NOT_READY,
  };
};

function reducer(state: UnwrapState, action: Action): UnwrapState {
  switch (action.type) {
    case UnwrapAction.TOKEN_SELECT:
      return {
        ...state,
        status: UnwrapStatus.NOT_READY,
        ...action.payload,
        currentBalance: new BigNumber(0),
        amountToUnwrap: new BigNumber(0),
      };
    case UnwrapAction.USER_BALANCE_CHANGE:
      return tryReady({ ...state, ...action.payload });
    case UnwrapAction.AMOUNT_TO_UNWRAP_CHANGE:
      const { amountToUnwrap } = action.payload;
      return tryReady({ ...state, amountToUnwrap });
    case UnwrapAction.RUN_UNWRAP:
      return {
        ...state,
        status: UnwrapStatus.WAITING_FOR_UNWRAP,
      };
    case UnwrapAction.WALLET_CHANGE:
      const { ethAccount, tezosAccount, tezosLibrary } = action.payload;
      const contractFactory =
        ethAccount && tezosAccount && tezosLibrary
          ? TezosUnwrapApiBuilder.withProvider(tezosLibrary)
              .forMinterContract(state.minterContractAddress)
              .forAccount(ethAccount, tezosAccount)
              .forFees(state.fees)
              .createFactory()
          : undefined;
      return {
        ...state,
        contractFactory,
        status: contractFactory ? state.status : UnwrapStatus.NOT_READY,
        connected: ethAccount !== undefined && tezosAccount !== undefined,
      };
  }

  return state;
}

export function useUnwrap() {
  const {
    fungibleTokens,
    fees,
    tezos: { minterContractAddress },
  } = useConfig();

  const {
    ethereum: { library: ethLibrary, account: ethAccount },
    tezos: { account: tzAccount, library: tezosLibrary },
  } = useWalletContext();

  useEffect(() => {
    dispatch({
      type: UnwrapAction.WALLET_CHANGE,
      payload: {
        ethLibrary,
        ethAccount: ethAccount || undefined,
        tezosAccount: tzAccount,
        tezosLibrary: tezosLibrary || undefined,
      },
    });
  }, [ethLibrary, ethAccount, tzAccount, tezosLibrary]);

  const [state, dispatch] = useReducer<typeof reducer>(reducer, {
    status: UnwrapStatus.UNINITIALIZED,
    token: Object.keys(fungibleTokens)[0] || '',
    connected: false,
    contract: null,
    minterContractAddress,
    currentBalance: new BigNumber(0),
    amountToUnwrap: new BigNumber(0),
    fees,
  });

  const selectToken = useCallback((token: string) => {
    dispatch({
      type: UnwrapAction.TOKEN_SELECT,
      payload: { token },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectAmountToUnwrap = useCallback((amountToUnwrap: BigNumber) => {
    dispatch({
      type: UnwrapAction.AMOUNT_TO_UNWRAP_CHANGE,
      payload: { amountToUnwrap },
    });
  }, []);

  const launchUnwrap = () => {
    const { contract, amountToUnwrap } = state;
    if (contract == null) return Promise.reject('Not ready');

    dispatch({ type: UnwrapAction.RUN_UNWRAP });
    const startUnwrapping = async () => {
      const operationHash = await contract.unwrap(amountToUnwrap);
      const op: UnwrapErc20Operation = {
        operationHash,
        hash: operationHash,
        source: ethAccount!,
        destination: tzAccount!,
        status: { type: StatusType.NEW },
        type: OperationType.UNWRAP,
        amount: amountToUnwrap,
        token: fungibleTokens[state.token].ethereumContractAddress,
        fees: unwrapFees(amountToUnwrap, fees),
      };
      return op;
    };

    return startUnwrapping();
  };

  useEffect(() => {
    const loadMetadata = async () => {
      if (!state.token || !state.contractFactory) {
        return;
      }
      const {
        ethereumContractAddress,
        tezosWrappingContract,
        tezosTokenId,
      } = fungibleTokens[state.token];
      const contract = state.contractFactory.forFa20(
        ethereumContractAddress,
        tezosWrappingContract,
        tezosTokenId
      );
      const currentBalance = await contract.balanceOf();
      dispatch({
        type: UnwrapAction.USER_BALANCE_CHANGE,
        payload: { currentBalance, contract },
      });
    };
    loadMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token, state.contractFactory]);

  return {
    ...state,
    selectToken,
    selectAmountToUnwrap: selectAmountToUnwrap,
    launchUnwrap,
    fungibleTokens,
    fees,
    tzAccount,
    ethAccount,
  };
}
