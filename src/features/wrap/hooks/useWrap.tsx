import { useCallback, useEffect, useReducer } from 'react';
import {
  EthereumWrapApi,
  EthereumWrapApiBuilder,
  EthereumWrapApiFactory,
} from '../../ethereum/EthereumWrapApi';
import BigNumber from 'bignumber.js';
import { Web3Provider } from '@ethersproject/providers';
import { TezosToolkit } from '@taquito/taquito';
import { useConfig } from '../../../runtime/config/ConfigContext';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import {
  Operation,
  OperationType,
  StatusType,
} from '../../operations/state/types';
import { wrapFees } from '../../fees/fees';

type WrapState = {
  status: WrapStatus;
  token: string;
  contract: EthereumWrapApi | null;
  currentBalance: BigNumber;
  currentAllowance: BigNumber;
  amountToWrap: BigNumber;
  connected: boolean;
  contractFactory?: EthereumWrapApiFactory;
  custodianContractAddress: string;
};

export enum WrapStatus {
  UNINITIALIZED,
  WALLETS_CHANGED,
  TOKEN_SELECTED,
  USER_BALANCE_FETCHED,
  AMOUNT_TO_WRAP_SELECTED,
  WAITING_FOR_ALLOWANCE_APPROVAL,
  READY_TO_WRAP,
}

type Action =
  | {
      type: WrapStatus.TOKEN_SELECTED;
      payload: { token: string };
    }
  | {
      type: WrapStatus.USER_BALANCE_FETCHED;
      payload: {
        currentBalance: BigNumber;
        currentAllowance: BigNumber;
        contract: EthereumWrapApi;
      };
    }
  | {
      type: WrapStatus.AMOUNT_TO_WRAP_SELECTED;
      payload: { amountToWrap: BigNumber };
    }
  | { type: WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL }
  | {
      type: WrapStatus.READY_TO_WRAP;
      payload: { newCurrentAllowance: BigNumber };
    }
  | {
      type: WrapStatus.WALLETS_CHANGED;
      payload: Partial<{
        tezosAccount: string;
        tezosLibrary: TezosToolkit;
        ethAccount: string;
        ethLibrary: Web3Provider;
      }>;
    };

function reducer(state: WrapState, action: Action): WrapState {
  switch (action.type) {
    case WrapStatus.TOKEN_SELECTED:
      return {
        ...state,
        status: WrapStatus.TOKEN_SELECTED,
        ...action.payload,
        currentBalance: new BigNumber(0),
        currentAllowance: new BigNumber(0),
        amountToWrap: new BigNumber(0),
      };
    case WrapStatus.USER_BALANCE_FETCHED:
      return {
        ...state,
        status: WrapStatus.USER_BALANCE_FETCHED,
        ...action.payload,
      };
    case WrapStatus.AMOUNT_TO_WRAP_SELECTED:
      const { amountToWrap } = action.payload;
      return {
        ...state,
        amountToWrap,
        status: amountToWrap.lte(state.currentAllowance)
          ? WrapStatus.READY_TO_WRAP
          : WrapStatus.AMOUNT_TO_WRAP_SELECTED,
      };
    case WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL:
      return {
        ...state,
        status: WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL,
      };
    case WrapStatus.READY_TO_WRAP:
      return {
        ...state,
        status: WrapStatus.READY_TO_WRAP,
        currentAllowance: action.payload.newCurrentAllowance,
      };
    case WrapStatus.WALLETS_CHANGED:
      const { ethAccount, tezosAccount, ethLibrary } = action.payload;
      const ethWrapApiFactory =
        tezosAccount && ethAccount && ethLibrary
          ? EthereumWrapApiBuilder.withProvider(ethLibrary)
              .forCustodianContract(state.custodianContractAddress)
              .forAccount(ethAccount, tezosAccount)
              .createFactory()
          : undefined;
      return {
        ...state,
        contractFactory: ethWrapApiFactory,
        connected: ethAccount !== undefined && tezosAccount !== undefined,
      };
  }

  return state;
}

export function useWrap() {
  const {
    fungibleTokens,
    fees,
    ethereum: { custodianContractAddress },
  } = useConfig();

  const {
    ethereum: { library: ethLibrary, account: ethAccount },
    tezos: { account: tzAccount, library: tezosLibrary },
  } = useWalletContext();

  const [state, dispatch] = useReducer<typeof reducer>(reducer, {
    status: WrapStatus.UNINITIALIZED,
    token: Object.keys(fungibleTokens)[0] || '',
    contract: null,
    currentBalance: new BigNumber(0),
    currentAllowance: new BigNumber(0),
    amountToWrap: new BigNumber(0),
    connected: false,
    custodianContractAddress,
  });

  useEffect(() => {
    dispatch({
      type: WrapStatus.WALLETS_CHANGED,
      payload: {
        ethLibrary,
        ethAccount: ethAccount || undefined,
        tezosAccount: tzAccount,
        tezosLibrary: tezosLibrary || undefined,
      },
    });
  }, [ethLibrary, ethAccount, tzAccount, tezosLibrary]);

  const selectToken = useCallback((token: string) => {
    dispatch({
      type: WrapStatus.TOKEN_SELECTED,
      payload: { token },
    });
  }, []);

  const selectAmountToWrap = useCallback((amountToWrap: BigNumber) => {
    dispatch({
      type: WrapStatus.AMOUNT_TO_WRAP_SELECTED,
      payload: { amountToWrap },
    });
  }, []);

  const launchAllowanceApproval = useCallback(() => {
    const startAllowanceProcess = async () => {
      const { amountToWrap, contract, currentAllowance } = state;
      if (amountToWrap.lte(currentAllowance)) return;
      if (contract == null) return;
      await contract.approve(amountToWrap);
      dispatch({ type: WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL });
      let counter = 0;
      const refreshCurrentAllowance = () =>
        setTimeout(async () => {
          counter++;
          const newAllowance = await contract.allowanceOf();
          if (amountToWrap.lte(newAllowance)) {
            dispatch({
              type: WrapStatus.READY_TO_WRAP,
              payload: { newCurrentAllowance: newAllowance },
            });
            return;
          } else {
            if (counter > 30) throw new Error('Timeout');
            refreshCurrentAllowance();
          }
        }, 1500);
      refreshCurrentAllowance();
    };

    return startAllowanceProcess();
  }, [state]);

  const launchWrap = useCallback(() => {
    const { contract, amountToWrap } = state;
    if (contract == null) return Promise.reject('Not ready');

    const startWrapping = async () => {
      const transactionHash = await contract.wrap(amountToWrap);
      const op: Operation = {
        transactionHash,
        source: ethAccount || '',
        destination: tzAccount || '',
        status: { type: StatusType.NEW },
        type: OperationType.WRAP,
        amount: amountToWrap,
        token: state.token,
        fees: wrapFees(amountToWrap, fees),
      };
      return op;
    };

    return startWrapping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.contract, state.amountToWrap]);

  useEffect(() => {
    const loadMetadata = async () => {
      if (!state.token || !state.contractFactory) {
        return;
      }
      const contract = state.contractFactory.forErc20(
        fungibleTokens[state.token].ethereumContractAddress
      );
      const currentBalance = await contract.balanceOf();
      const currentAllowance = await contract.allowanceOf();
      dispatch({
        type: WrapStatus.USER_BALANCE_FETCHED,
        payload: { currentBalance, currentAllowance, contract },
      });
    };
    loadMetadata();
    // eslint-disable-next-line
  }, [state.token, state.contractFactory]);

  return {
    ...state,
    fees,
    fungibleTokens,
    selectToken,
    selectAmountToWrap,
    launchAllowanceApproval,
    launchWrap,
  };
}
