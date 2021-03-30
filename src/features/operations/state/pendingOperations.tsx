import { atom, selector, useRecoilState, useSetRecoilState } from 'recoil';
import { Operation, StatusType, toOperations, WrapOperation } from './types';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import {
  useConfig,
  useIndexerApi,
} from '../../../runtime/config/ConfigContext';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';

export const OperationStateKey = 'OPERATIONS_STATE';
export const OperationsCountKey = 'OPERATIONS_COUNT';

export const operationsState = atom<Operation[]>({
  key: OperationStateKey,
  default: [],
});

export function usePendingOperationsActions() {
  const { enqueueSnackbar } = useSnackbar();
  const {
    tezos: { library: tzLibrary },
  } = useWalletContext();
  const {
    tezos: { quorumContractAddress, minterContractAddress },
  } = useConfig();
  let setOperations = useSetRecoilState(operationsState);

  const addOperation = (o: Operation) => {
    enqueueSnackbar('Assets locked. Waiting for confirmations.', {
      variant: 'info',
    });
    setOperations((operations) => [o, ...operations]);
  };

  const mintErc20 = async (op: WrapOperation): Promise<string> => {
    const contract = await tzLibrary!.wallet.at(quorumContractAddress);
    if (op.status.type !== StatusType.READY) {
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
        op.amount,
        minterContractAddress,
        mintSignatures
      )
      .send();
    enqueueSnackbar('Minting operation sent', { variant: 'info' });
    await result.receipt();
    return result.opHash;
  };

  return { addOperation, mintErc20 };
}

export const pendingOperationsCount = selector({
  key: OperationsCountKey,
  get: ({ get }) => {
    const operations = get(operationsState);
    return operations.length;
  },
});

export const useOperationsPolling = () => {
  const indexerApi = useIndexerApi();

  const [operations, setOperations] = useRecoilState(operationsState);

  const { fees } = useConfig();

  const {
    ethereum: { account: ethAccount },
    tezos: { account: tzAccount },
  } = useWalletContext();

  useEffect(() => {
    const loadPendingWrap = async () => {
      if (!ethAccount && !tzAccount) {
        return;
      }
      const pendingWrap = await indexerApi.fetchPendingWrap(
        ethAccount,
        tzAccount
      );
      setOperations(toOperations(fees, pendingWrap));
    };
    // noinspection JSIgnoredPromiseFromCall
    loadPendingWrap();
    const intervalId = setInterval(loadPendingWrap, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethAccount, tzAccount]);

  return { operations };
};
