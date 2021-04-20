import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import {
  useConfig,
  useIndexerApi,
} from '../../../runtime/config/ConfigContext';
import { useEffect, useMemo, useReducer } from 'react';
import { Operation, OperationStatusType, OperationType } from '../state/types';
import {
  markAsDone,
  markAsNew,
  unwrapToOperations,
  wrapsToOperations,
} from '../state/operation';
import { ethers } from 'ethers';
import CUSTODIAN_ABI from '../../ethereum/custodianContractAbi';
import ERC20_ABI from '../../ethereum/erc20Abi';
import { TokenMetadata } from '../../swap/token';
import IndexerApi, {
  IndexerUnwrapPayload,
  IndexerWrapPayload,
} from '../../indexer/indexerApi';
import { Fees } from '../../../config';
import { Web3Provider } from '@ethersproject/providers';
import { TezosToolkit } from '@taquito/taquito';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { ConnectionStatus } from '../../wallet/connectionStatus';

enum ReceiptAction {
  INITIALIZE,
  FETCH_RECEIPT,
  RECEIPT_FETCHED,
  RELOAD,
  UPDATE_WRAP,
  UPDATE_UNWRAP,
  UPDATE,
  RELEASE,
  MINT,
  BEGIN_APPLY,
  WALLET_CHANGE,
}

export enum ReceiptStatus {
  UNINITIALIZED,
  NEED_RECEIPT,
  NEED_REFRESH,
  READY_TO_APPLY,
  WAITING_FOR_APPLY,
  DONE,
}

type ReceiptState = {
  status: ReceiptStatus;
  operation?: Operation;
  tzStatus: ConnectionStatus;
  ethStatus: ConnectionStatus;
};

type Action =
  | { type: ReceiptAction.INITIALIZE; payload: { operation: Operation } }
  | {
      type: ReceiptAction.FETCH_RECEIPT;
      payload: {
        hash: string;
        type: OperationType;
        ethLibrary?: Web3Provider;
        tzLibrary?: TezosToolkit;
      };
    }
  | {
      type: ReceiptAction.RELOAD;
      payload: {
        hash: string;
        type: OperationType;
        fees: Fees;
        signaturesThreshold: number;
      };
    }
  | { type: ReceiptAction.UPDATE; payload: { operation: Operation } }
  | {
      type: ReceiptAction.WALLET_CHANGE;
      payload: { tzStatus: ConnectionStatus; ethStatus: ConnectionStatus };
    }
  | {
      type: ReceiptAction.UPDATE_WRAP;
      payload: {
        data: IndexerWrapPayload;
        fees: Fees;
        signaturesThreshold: number;
      };
    }
  | {
      type: ReceiptAction.UPDATE_UNWRAP;
      payload: {
        data: IndexerUnwrapPayload;
        fees: Fees;
        signaturesThreshold: number;
      };
    }
  | {
      type: ReceiptAction.RECEIPT_FETCHED;
      payload: { receipt?: TransactionReceipt };
    }
  | {
      type: ReceiptAction.MINT;
      payload: {
        tzLibrary: TezosToolkit;
        quorumContractAddress: string;
        minterContractAddress: string;
      };
    }
  | {
      type: ReceiptAction.RELEASE;
      payload: {
        ethLibrary: Web3Provider;
        custodianContractAddress: string;
      };
    }
  | { type: ReceiptAction.BEGIN_APPLY };

const toReceiptStatus = (opStatus: OperationStatusType): ReceiptStatus => {
  switch (opStatus) {
    case OperationStatusType.NEW:
      return ReceiptStatus.NEED_REFRESH;
    case OperationStatusType.WAITING_FOR_RECEIPT:
      return ReceiptStatus.NEED_RECEIPT;
    case OperationStatusType.WAITING_FOR_CONFIRMATIONS:
    case OperationStatusType.WAITING_FOR_SIGNATURES:
      return ReceiptStatus.NEED_REFRESH;
    case OperationStatusType.READY:
      return ReceiptStatus.READY_TO_APPLY;
    case OperationStatusType.DONE:
      return ReceiptStatus.DONE;
  }
};

const reducer = (state: ReceiptState, action: Action): ReceiptState => {
  switch (action.type) {
    case ReceiptAction.UPDATE_WRAP: {
      const { fees, signaturesThreshold, data } = action.payload;
      const all = wrapsToOperations(fees, signaturesThreshold, data);
      if (all.length > 0) {
        return {
          ...state,
          status: toReceiptStatus(all[0].status.type),
          operation: all[0],
        };
      }
      break;
    }
    case ReceiptAction.UPDATE_UNWRAP: {
      const { fees, signaturesThreshold, data } = action.payload;
      const all = unwrapToOperations(fees, signaturesThreshold, data);
      if (all.length > 0) {
        return {
          ...state,
          status: toReceiptStatus(all[0].status.type),
          operation: all[0],
        };
      }
      break;
    }
    case ReceiptAction.UPDATE:
      return {
        ...state,
        status: toReceiptStatus(action.payload.operation.status.type),
        operation: action.payload.operation,
      };
    case ReceiptAction.RECEIPT_FETCHED:
      if (!state.operation || !action.payload.receipt) {
        return state;
      }
      const updatedOp = markAsNew(state.operation);
      return {
        ...state,
        operation: updatedOp,
        status: toReceiptStatus(updatedOp.status.type),
      };
    case ReceiptAction.WALLET_CHANGE:
      const { ethStatus, tzStatus } = action.payload;
      return {
        ...state,
        ethStatus,
        tzStatus,
      };
    case ReceiptAction.BEGIN_APPLY: {
      return { ...state, status: ReceiptStatus.WAITING_FOR_APPLY };
    }
  }
  return state;
};

const buildFullSignature = (signatures: Record<string, string>) => {
  const orderedSigners = Object.keys(signatures).sort();
  return orderedSigners.reduce(
    (previousValue, currentValue) =>
      previousValue + signatures[currentValue].replace('0x', ''),
    '0x'
  );
};

const sideEffectReducer = (
  getState: () => ReceiptState,
  dispatch: (a: Action) => void,
  api: IndexerApi
) => async (a: Action) => {
  switch (a.type) {
    case ReceiptAction.FETCH_RECEIPT: {
      const { hash, ethLibrary } = a.payload;
      const receipt = await ethLibrary?.getTransactionReceipt(hash);
      dispatch({ type: ReceiptAction.RECEIPT_FETCHED, payload: { receipt } });
      break;
    }
    case ReceiptAction.RELOAD:
      const { type, hash, signaturesThreshold, fees } = a.payload;
      switch (type) {
        case OperationType.WRAP: {
          const payload = await api.fetchWrapsByHash(hash);
          dispatch({
            type: ReceiptAction.UPDATE_WRAP,
            payload: { data: payload, signaturesThreshold, fees },
          });
          break;
        }
        case OperationType.UNWRAP: {
          const payload = await api.fetchUnwrapsByHash(hash);
          dispatch({
            type: ReceiptAction.UPDATE_UNWRAP,
            payload: { data: payload, signaturesThreshold, fees },
          });
          break;
        }
      }
      break;
    case ReceiptAction.MINT: {
      const {
        tzLibrary,
        quorumContractAddress,
        minterContractAddress,
      } = a.payload;
      const op = getState().operation;
      dispatch({ type: ReceiptAction.BEGIN_APPLY });
      const contract = await tzLibrary.wallet.at(quorumContractAddress);
      if (!op) {
        return Promise.reject('Not ready');
      }
      if (op.status.type !== OperationStatusType.READY) {
        return Promise.reject('Not ready');
      }
      const mintSignatures = Object.entries(op.status.signatures);
      const [blockHash, logIndex] = op.status.id.split(':');
      const result = await contract.methods
        .minter(
          'mint_erc20',
          op.token.toLowerCase().substring(2),
          blockHash.substring(2),
          logIndex,
          op.destination,
          op.amount.toFixed(),
          minterContractAddress,
          mintSignatures
        )
        .send();
      await result.receipt();
      dispatch({
        type: ReceiptAction.UPDATE,
        payload: { operation: markAsDone(op) },
      });
      break;
    }
    case ReceiptAction.RELEASE: {
      const { ethLibrary, custodianContractAddress } = a.payload;
      const op = getState().operation;
      if (!op) {
        return Promise.reject('Not loaded');
      }
      if (op.status.type !== OperationStatusType.READY) {
        return Promise.reject('Operation is not ready');
      }
      dispatch({ type: ReceiptAction.BEGIN_APPLY });
      const custodianContract = new ethers.Contract(
        custodianContractAddress,
        new ethers.utils.Interface(CUSTODIAN_ABI),
        ethLibrary?.getSigner()
      );
      const erc20Interface = new ethers.utils.Interface(ERC20_ABI);
      const data = erc20Interface.encodeFunctionData('transfer', [
        op.destination,
        op.amount.toFixed(),
      ]);
      const result = await custodianContract.execTransaction(
        op.token,
        0,
        data,
        op.status.id,
        buildFullSignature(op.status.signatures)
      );
      await result.wait();
      dispatch({
        type: ReceiptAction.UPDATE,
        payload: { operation: markAsDone(op) },
      });
      break;
    }
    default:
      dispatch(a);
  }
};

const extractHash = (value: string | Operation): string =>
  typeof value === 'string' ? value : value.hash;

export const useOperation = (
  initialValue: string | Operation,
  type: OperationType
) => {
  const {
    tezos: { library: tzLibrary, status: tzStatus },
    ethereum: { library: ethLibrary, status: ethStatus },
  } = useWalletContext();

  const indexerApi = useIndexerApi();

  const {
    fees,
    wrapSignatureThreshold,
    unwrapSignatureThreshold,
    fungibleTokens,
    tezos: { quorumContractAddress, minterContractAddress },
    ethereum: { custodianContractAddress },
  } = useConfig();

  const [state, dispatch] = useReducer<typeof reducer>(reducer, {
    status: ReceiptStatus.UNINITIALIZED,
    tzStatus,
    ethStatus,
  });

  const effectsDispatch = sideEffectReducer(() => state, dispatch, indexerApi);

  useEffect(() => {
    if (typeof initialValue === 'string') {
      effectsDispatch({
        type: ReceiptAction.RELOAD,
        payload: {
          hash: initialValue,
          fees,
          type,
          signaturesThreshold: wrapSignatureThreshold,
        },
      });
    } else {
      effectsDispatch({
        type: ReceiptAction.UPDATE,
        payload: { operation: initialValue },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  useEffect(() => {
    effectsDispatch({
      type: ReceiptAction.WALLET_CHANGE,
      payload: { tzStatus, ethStatus },
    });
  }, [tzStatus, ethStatus]);

  const tokensByEthAddress = useMemo(
    () =>
      Object.entries(fungibleTokens).reduce<Record<string, TokenMetadata>>(
        (acc, [, metadata]) => {
          acc[metadata.ethereumContractAddress] = metadata;
          return acc;
        },
        {}
      ),
    [fungibleTokens]
  );

  useEffect(() => {
    if (state.status !== ReceiptStatus.NEED_REFRESH) {
      return;
    }

    const dispatchRefresh = () => {
      // noinspection JSIgnoredPromiseFromCall
      effectsDispatch({
        type: ReceiptAction.RELOAD,
        payload: {
          hash: extractHash(initialValue),
          fees,
          type,
          signaturesThreshold: wrapSignatureThreshold,
        },
      });
    };

    dispatchRefresh();
    const intervalId = setInterval(dispatchRefresh, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [state.status]);

  useEffect(() => {
    if (state.status !== ReceiptStatus.NEED_RECEIPT) {
      return;
    }
    const dispatchRefresh = () => {
      // noinspection JSIgnoredPromiseFromCall
      effectsDispatch({
        type: ReceiptAction.FETCH_RECEIPT,
        payload: {
          hash: extractHash(initialValue),
          type,
          ethLibrary,
          tzLibrary,
        },
      });
    };

    dispatchRefresh();
    const intervalId = setInterval(dispatchRefresh, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [state.status, ethLibrary, tzLibrary]);

  const mintErc20 = () =>
    tzLibrary
      ? effectsDispatch({
          type: ReceiptAction.MINT,
          payload: { minterContractAddress, quorumContractAddress, tzLibrary },
        })
      : Promise.reject('Not connected');

  const unlockErc20 = () =>
    ethLibrary
      ? effectsDispatch({
          type: ReceiptAction.RELEASE,
          payload: { custodianContractAddress, ethLibrary },
        })
      : Promise.reject('Not connected');

  return {
    state,
    fungibleTokens,
    signaturesThreshold: {
      wrap: wrapSignatureThreshold,
      unwrap: unwrapSignatureThreshold,
    },
    mintErc20,
    unlockErc20,
  };
};
