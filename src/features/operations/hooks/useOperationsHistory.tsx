import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import {
  useConfig,
  useIndexerApi,
} from '../../../runtime/config/ConfigContext';
import { useEffect, useState } from 'react';
import {
  Operation,
  UnwrapErc20Operation,
  WrapErc20Operation,
} from '../state/types';
import { unwrapToOperations, wrapsToOperations } from '../state/operation';
import { useHistory } from 'react-router';
import { useRecoilCallback } from 'recoil';
import { operationByHashState } from '../state/pendingOperations';
import { operationPage } from '../../../screens/routes';

type OperationsHistoryState = {
  mints: WrapErc20Operation[];
  burns: UnwrapErc20Operation[];
};

export const useOperationsHistory = () => {
  const {
    ethereum: { account: ethAccount },
    tezos: { account: tzAccount },
  } = useWalletContext();

  const history = useHistory();
  const indexerApi = useIndexerApi();
  const { fees, wrapSignatureThreshold } = useConfig();
  const [count, setCount] = useState(0);
  const [canFetch, setCanFetch] = useState(false);

  const [operations, setOperations] = useState<OperationsHistoryState>({
    mints: [],
    burns: [],
  });

  useEffect(() => {
    const loadPendingWrap = async () => {
      if (!ethAccount && !tzAccount) {
        setOperations({ burns: [], mints: [] });
        return;
      }

      const [pendingWrap, pendingUnwrap] = await Promise.all([
        indexerApi.fetchPendingWrap(ethAccount, tzAccount),
        indexerApi.fetchPendingUnwrap(ethAccount, tzAccount),
      ]);
      const mintsFromIndexer = wrapsToOperations(
        fees,
        wrapSignatureThreshold,
        pendingWrap
      );
      const burnsFromIndexer = unwrapToOperations(
        fees,
        wrapSignatureThreshold,
        pendingUnwrap
      );

      setOperations({
        mints: mintsFromIndexer,
        burns: burnsFromIndexer,
      });
    };
    // noinspection JSIgnoredPromiseFromCall
    loadPendingWrap();
    const intervalId = setInterval(loadPendingWrap, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethAccount, tzAccount]);

  const selectOperation = useRecoilCallback(({ set }) => (op: Operation) => {
    set(operationByHashState(op.hash), op);
    history.push(operationPage(op));
  });

  useEffect(() => setCount(operations.burns.length + operations.mints.length), [
    operations,
  ]);

  useEffect(
    () => setCanFetch(tzAccount !== undefined || ethAccount !== undefined),
    [tzAccount, ethAccount]
  );

  return { operations, count, canFetch, selectOperation };
};
