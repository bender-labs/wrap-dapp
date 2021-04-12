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
  OperationStatusType,
} from '../../operations/state/types';
import { wrapFees } from '../../fees/fees';
import { useSnackbar } from 'notistack';

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
  networkFees: BigNumber;
};

export enum WrapAction {
  WALLET_CHANGE,
  USER_BALANCE_CHANGE,
  AMOUNT_TO_WRAP_CHANGE,
  TOKEN_SELECT,
  ALLOWANCE_CHANGE,
  RUN_ALLOWANCE,
  RUN_WRAP,
  WRAP_DONE,
  NETWORK_FEES,
}

export enum WrapStatus {
  NOT_READY,
  READY_TO_CONFIRM,
  WAITING_FOR_ALLOWANCE_APPROVAL,
  READY_TO_WRAP,
  WAITING_FOR_WRAP,
}

type Action =
  | {
      type: WrapAction.TOKEN_SELECT;
      payload: { token: string };
    }
  | {
      type: WrapAction.USER_BALANCE_CHANGE;
      payload: {
        currentBalance: BigNumber;
        currentAllowance: BigNumber;
        contract: EthereumWrapApi;
      };
    }
  | {
      type: WrapAction.AMOUNT_TO_WRAP_CHANGE;
      payload: {
        amountToWrap: BigNumber;
      };
    }
  | {
      type: WrapAction.ALLOWANCE_CHANGE;
      payload: { newCurrentAllowance: BigNumber };
    }
  | {
      type: WrapAction.RUN_ALLOWANCE;
    }
  | {
      type: WrapAction.WALLET_CHANGE;
      payload: Partial<{
        tezosAccount: string;
        tezosLibrary: TezosToolkit;
        ethAccount: string;
        ethLibrary: Web3Provider;
      }>;
    }
  | {
      type: WrapAction.RUN_WRAP;
    }
  | { type: WrapAction.WRAP_DONE }
  | {
      type: WrapAction.NETWORK_FEES;
      payload: {
        networkFees: BigNumber;
      };
    };

export function initialState(token: string, custodianContractAddress: string) {
  return {
    status: WrapStatus.NOT_READY,
    token: token,
    contract: null,
    currentBalance: new BigNumber(0),
    currentAllowance: new BigNumber(0),
    amountToWrap: new BigNumber(0),
    connected: false,
    custodianContractAddress,
    networkFees: new BigNumber(0),
  };
}

const tryReady = (state: WrapState): WrapState => {
  if (
    !state.connected ||
    state.amountToWrap.isZero() ||
    state.amountToWrap.isNaN() ||
    state.amountToWrap.isGreaterThan(state.currentBalance)
  ) {
    return { ...state, status: WrapStatus.NOT_READY };
  }
  const newStatus = state.amountToWrap.lte(state.currentAllowance)
    ? WrapStatus.READY_TO_WRAP
    : WrapStatus.READY_TO_CONFIRM;

  return { ...state, status: newStatus };
};

export function reducer(state: WrapState, action: Action): WrapState {
  switch (action.type) {
    case WrapAction.TOKEN_SELECT:
      return {
        ...state,
        status: WrapStatus.NOT_READY,
        ...action.payload,
        currentBalance: new BigNumber(0),
        currentAllowance: new BigNumber(0),
        amountToWrap: new BigNumber(0),
      };
    case WrapAction.USER_BALANCE_CHANGE:
      return tryReady({
        ...state,
        ...action.payload,
      });
    case WrapAction.AMOUNT_TO_WRAP_CHANGE:
      const { amountToWrap } = action.payload;
      return tryReady({
        ...state,
        amountToWrap,
      });
    case WrapAction.RUN_ALLOWANCE:
      return {
        ...state,
        status: WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL,
      };
    case WrapAction.ALLOWANCE_CHANGE:
      return {
        ...state,
        status: WrapStatus.READY_TO_WRAP,
        currentAllowance: action.payload.newCurrentAllowance,
      };
    case WrapAction.RUN_WRAP:
      return {
        ...state,
        status: WrapStatus.WAITING_FOR_WRAP,
      };
    case WrapAction.NETWORK_FEES:
      return {
        ...state,
        networkFees: action.payload.networkFees,
      };
    case WrapAction.WRAP_DONE: {
      return {
        ...state,
        status: WrapStatus.READY_TO_WRAP,
      };
    }
    case WrapAction.WALLET_CHANGE:
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
        currentBalance: new BigNumber(0),
        contractFactory: ethWrapApiFactory,
        status: ethWrapApiFactory ? state.status : WrapStatus.NOT_READY,
        connected: ethAccount !== undefined && tezosAccount !== undefined,
      };
  }

  return state;
}

export function useWrap() {
  const { enqueueSnackbar } = useSnackbar();

  const {
    fungibleTokens,
    fees,
    ethereum: { custodianContractAddress },
  } = useConfig();

  const {
    ethereum: { library: ethLibrary, account: ethAccount },
    tezos: { account: tzAccount, library: tezosLibrary },
  } = useWalletContext();

  const [state, dispatch] = useReducer<typeof reducer>(
    reducer,
    initialState(Object.keys(fungibleTokens)[0], custodianContractAddress)
  );

  useEffect(() => {
    dispatch({
      type: WrapAction.WALLET_CHANGE,
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
      type: WrapAction.TOKEN_SELECT,
      payload: { token },
    });
  }, []);

  const selectAmountToWrap = useCallback((amountToWrap: BigNumber) => {
    dispatch({
      type: WrapAction.AMOUNT_TO_WRAP_CHANGE,
      payload: { amountToWrap },
    });
  }, []);

  const launchAllowanceApproval = useCallback(() => {
    const startAllowanceProcess = async () => {
      const { amountToWrap, contract, currentAllowance } = state;
      if (amountToWrap.lte(currentAllowance)) return;
      if (contract == null) return;
      await contract.approve(amountToWrap);
      dispatch({ type: WrapAction.RUN_ALLOWANCE });
      let counter = 0;
      const refreshCurrentAllowance = () =>
        setTimeout(async () => {
          counter++;
          const newAllowance = await contract.allowanceOf();
          if (amountToWrap.lte(newAllowance)) {
            dispatch({
              type: WrapAction.ALLOWANCE_CHANGE,
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

  const launchWrap = () => {
    const { contract, amountToWrap } = state;
    if (contract == null) return Promise.reject('Not ready');

    const startWrapping = async () => {
      try {
        const transactionHash = await contract.wrap(amountToWrap);
        const op: Operation = {
          transactionHash,
          hash: transactionHash,
          source: ethAccount!,
          destination: tzAccount!,
          status: { type: OperationStatusType.WAITING_FOR_RECEIPT },
          type: OperationType.WRAP,
          amount: amountToWrap,
          token: fungibleTokens[state.token].ethereumContractAddress,
          fees: wrapFees(amountToWrap, fees),
        };

        return op;
      } catch (e) {
        enqueueSnackbar('Error while calling wrap', { variant: 'error' });
      }
      dispatch({ type: WrapAction.WRAP_DONE });
    };
    dispatch({ type: WrapAction.RUN_WRAP });
    return startWrapping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    const computeNetworkFees = async () => {
      const { status, contract, amountToWrap } = state;
      if (status !== WrapStatus.READY_TO_WRAP || contract == null) {
        return;
      }
      const networkFees = await contract.networkFees(amountToWrap);
      dispatch({ type: WrapAction.NETWORK_FEES, payload: { networkFees } });
    };

    let tryNumber = 0;
    try {
      computeNetworkFees();
    } catch (e) {
      if (tryNumber === 1) {
        setTimeout(computeNetworkFees, 1000);
        tryNumber++;
      }
    }
  }, [state.status]);

  useEffect(() => {
    const loadMetadata = async () => {
      if (!state.token || !state.contractFactory) {
        return;
      }
      const contract = state.contractFactory.forErc20(
        fungibleTokens[state.token].ethereumContractAddress
      );
      const [currentBalance, currentAllowance] = await Promise.all([
        contract.balanceOf(),
        contract.allowanceOf(),
      ]);
      dispatch({
        type: WrapAction.USER_BALANCE_CHANGE,
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
    tzAccount,
    ethAccount,
    launchWrap,
  };
}
