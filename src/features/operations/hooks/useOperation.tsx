import { useRecoilState } from 'recoil';
import { operationByHashState } from '../state/pendingOperations';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import {
  useConfig,
  useIndexerApi,
} from '../../../runtime/config/ConfigContext';
import { useEffect } from 'react';
import { StatusType } from '../state/types';
import { markAsNew, mergeSingle, wrapsToOperations } from '../state/operation';

export const useOperation = (hash: string) => {
  const {
    ethereum: { library },
  } = useWalletContext();
  const indexerApi = useIndexerApi();

  const { fees, wrapSignatureThreshold, fungibleTokens } = useConfig();

  const [operation, setOp] = useRecoilState(operationByHashState(hash));

  useEffect(() => {
    const fetchReceipt = async () => {
      await library?.getTransactionReceipt(hash);
      setOp(markAsNew(operation!));
    };
    if (operation?.status.type === StatusType.WAITING_FOR_RECEIPT && library) {
      // noinspection JSIgnoredPromiseFromCall
      fetchReceipt();
    }
    // eslint-disable-next-line
  }, [hash, operation, library]);

  useEffect(() => {
    const fetch = async () => {
      const payload = await indexerApi.fetchWrapsByHash(hash);
      const all = wrapsToOperations(fees, wrapSignatureThreshold, payload);
      if (all.length > 0) {
        setOp(mergeSingle(all[0], operation));
      }
    };

    if (
      !operation ||
      (operation?.status.type !== StatusType.DONE &&
        operation?.status.type !== StatusType.READY)
    ) {
      // noinspection JSIgnoredPromiseFromCall
      fetch();
      const intervalId = setInterval(fetch, 5000);
      return () => {
        clearInterval(intervalId);
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operation]);

  return { operation, fungibleTokens };
};
