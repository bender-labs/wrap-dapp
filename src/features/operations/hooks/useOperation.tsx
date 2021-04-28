import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import {
  useConfig,
  useIndexerApi,
} from '../../../runtime/config/ConfigContext';
import { useEffect, useReducer } from 'react';
import { Operation, OperationType } from '../state/types';
import { ReceiptStatus, reducer, sideEffectReducer } from './reducer';
import { connectStore, createStore } from '../../types';
import {
  fetchReceipt,
  mint,
  release,
  reload,
  update,
  walletChange,
} from './actions';

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

  const effectsDispatch = connectStore(
    createStore(state, dispatch),
    sideEffectReducer(indexerApi)
  );

  useEffect(() => {
    if (typeof initialValue === 'string') {
      // noinspection JSIgnoredPromiseFromCall
      effectsDispatch(
        reload({
          hash: initialValue,
          fees,
          type,
          signaturesThreshold: wrapSignatureThreshold,
        })
      );
    } else {
      // noinspection JSIgnoredPromiseFromCall
      effectsDispatch(update({ operation: initialValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  useEffect(() => {
    // noinspection JSIgnoredPromiseFromCall
    effectsDispatch(walletChange({ tzStatus, ethStatus }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tzStatus, ethStatus]);

  useEffect(() => {
    if (state.status !== ReceiptStatus.NEED_REFRESH) {
      return;
    }

    const dispatchRefresh = () => {
      // noinspection JSIgnoredPromiseFromCall
      effectsDispatch(
        reload({
          hash: extractHash(initialValue),
          fees,
          type,
          signaturesThreshold: wrapSignatureThreshold,
        })
      );
    };

    dispatchRefresh();
    const intervalId = setInterval(dispatchRefresh, 5000);
    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  useEffect(() => {
    if (state.status !== ReceiptStatus.NEED_RECEIPT) {
      return;
    }
    const dispatchRefresh = () => {
      // noinspection JSIgnoredPromiseFromCall
      effectsDispatch(
        fetchReceipt({
          hash: extractHash(initialValue),
          type,
          ethLibrary,
          tzLibrary,
        })
      );
    };

    dispatchRefresh();
    const intervalId = setInterval(dispatchRefresh, 5000);
    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, ethLibrary, tzLibrary]);

  const mintErc20 = () => {
    if (!tzLibrary) return;
    effectsDispatch(
      mint({ minterContractAddress, quorumContractAddress, tzLibrary })
    );
  };
  const unlockErc20 = () =>
    ethLibrary
      ? effectsDispatch(release({ custodianContractAddress, ethLibrary }))
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
