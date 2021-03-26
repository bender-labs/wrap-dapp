import { useCallback, useEffect, useReducer } from 'react';
import {
  TezosUnwrapApi,
  TezosUnwrapApiBuilder,
  TezosUnwrapApiFactory,
} from '../../features/tezos/TezosUnwrapApi';
import BigNumber from 'bignumber.js';
import { useConfig } from '../../runtime/config/ConfigContext';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useTezosContext } from '../tezos/TezosContext';
import { TezosToolkit } from '@taquito/taquito';
import { Fees } from '../../config';

type UnwrapState = {
  status: UnwrapStatus;
  token: string;
  decimals: number;
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
  TOKEN_SELECTED,
  WALLET_CHANGED,
  USER_BALANCE_FETCHED,
  AMOUNT_TO_WRAP_SELECTED,
  READY_TO_UNWRAP,
}

type Action =
  | {
      type: UnwrapStatus.TOKEN_SELECTED;
      payload: { token: string; decimals: number };
    }
  | {
      type: UnwrapStatus.USER_BALANCE_FETCHED;
      payload: { currentBalance: BigNumber; contract: TezosUnwrapApi };
    }
  | {
      type: UnwrapStatus.AMOUNT_TO_WRAP_SELECTED;
      payload: { amountToUnwrap: BigNumber };
    }
  | { type: UnwrapStatus.READY_TO_UNWRAP; payload: {} }
  | {
      type: UnwrapStatus.WALLET_CHANGED;
      payload: Partial<{
        tezosAccount: string;
        tezosLibrary: TezosToolkit;
        ethAccount: string;
        ethLibrary: Web3Provider;
      }>;
    };

function reducer(state: UnwrapState, action: Action): UnwrapState {
  switch (action.type) {
    case UnwrapStatus.TOKEN_SELECTED:
      return {
        ...state,
        status: UnwrapStatus.TOKEN_SELECTED,
        ...action.payload,
        currentBalance: new BigNumber(0),
        amountToUnwrap: new BigNumber(0),
      };
    case UnwrapStatus.USER_BALANCE_FETCHED:
      return {
        ...state,
        status: UnwrapStatus.USER_BALANCE_FETCHED,
        ...action.payload,
      };
    case UnwrapStatus.AMOUNT_TO_WRAP_SELECTED:
      const { amountToUnwrap } = action.payload;
      return {
        ...state,
        amountToUnwrap: amountToUnwrap,
        status: amountToUnwrap.lte(state.currentBalance)
          ? UnwrapStatus.READY_TO_UNWRAP
          : UnwrapStatus.AMOUNT_TO_WRAP_SELECTED,
      };
    case UnwrapStatus.READY_TO_UNWRAP:
      return {
        ...state,
        status: UnwrapStatus.READY_TO_UNWRAP,
      };
    case UnwrapStatus.WALLET_CHANGED:
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
    library: ethLibrary,
    account: ethAccount,
  } = useWeb3React<Web3Provider>();

  const { account: tzAccount, library: tezosLibrary } = useTezosContext();

  useEffect(() => {
    dispatch({
      type: UnwrapStatus.WALLET_CHANGED,
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
    decimals: 0,
    contract: null,
    minterContractAddress,
    currentBalance: new BigNumber(0),
    amountToUnwrap: new BigNumber(0),
    fees,
  });

  const selectToken = useCallback(
    (token: string) => {
      const { decimals } = fungibleTokens[token];

      dispatch({
        type: UnwrapStatus.TOKEN_SELECTED,
        payload: { token, decimals },
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [state.token, state.connected]
  );

  const selectAmountToUnwrap = useCallback((amountToUnwrap: BigNumber) => {
    dispatch({
      type: UnwrapStatus.AMOUNT_TO_WRAP_SELECTED,
      payload: { amountToUnwrap },
    });
  }, []);

  const launchWrap = useCallback(() => {
    const { contract, amountToUnwrap } = state;
    if (contract == null) return;

    const startWrapping = async () => {
      await contract.unwrap(amountToUnwrap);
    };

    startWrapping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.contract, state.amountToUnwrap]);

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
        type: UnwrapStatus.USER_BALANCE_FETCHED,
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
    launchWrap,
    fungibleTokens,
    fees,
  };
}
