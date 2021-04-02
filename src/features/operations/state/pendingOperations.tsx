import {
  atom,
  atomFamily,
  selector,
  useRecoilCallback,
  useRecoilState,
} from 'recoil';
import {
  Operation,
  OperationType,
  StatusType,
  UnwrapErc20Operation,
  WrapErc20Operation,
} from './types';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import {
  useConfig,
  useIndexerApi,
} from '../../../runtime/config/ConfigContext';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import {
  markAsDone,
  mergeSingle,
  unwrapToOperations,
  wrapsToOperations,
} from './operation';
import { ethers } from 'ethers';
import CUSTODIAN_ABI from '../../ethereum/custodianContractAbi';
import ERC20_ABI from '../../ethereum/erc20Abi';

export const OperationStateKey = 'OPERATIONS_STATE';
export const PendingOperationsStateKey = 'PENDING_OPERATIONS_STATE';
export const OperationsCountKey = 'OPERATIONS_COUNT';
export const OperationsByHashStateKey = 'OPERATIONS_BY_HASH';

export const operationsState = atom<{ mints: Operation[]; burns: Operation[] }>(
  {
    key: OperationStateKey,
    default: { mints: [], burns: [] },
  }
);

export const pendingOperationsState = atom<{
  mints: string[];
  burns: string[];
}>({
  key: PendingOperationsStateKey,
  default: { mints: [], burns: [] },
});

export const operationByHashState = atomFamily<Operation | undefined, string>({
  key: OperationsByHashStateKey,
  default: undefined,
});

export function usePendingOperationsActions() {
  const { enqueueSnackbar } = useSnackbar();
  const {
    tezos: { library: tzLibrary },
    ethereum: { library: ethLibrary },
  } = useWalletContext();
  const {
    tezos: { quorumContractAddress, minterContractAddress },
    ethereum: { custodianContractAddress },
  } = useConfig();

  const addOperation = useRecoilCallback(
    ({ snapshot, set }) => async (o: Operation) => {
      const current = await snapshot.getPromise(pendingOperationsState);
      switch (o.type) {
        case OperationType.WRAP: {
          set(pendingOperationsState, {
            ...current,
            mints: [...current.mints, o.transactionHash],
          });
          set(operationByHashState(o.transactionHash), o);
          break;
        }
        case OperationType.UNWRAP: {
          set(pendingOperationsState, {
            ...current,
            burns: [...current.burns, o.operationHash],
          });
          set(operationByHashState(o.operationHash), o);
          break;
        }
      }
    }
  );

  const mintErc20 = useRecoilCallback(
    ({ set }) => async (op: WrapErc20Operation): Promise<string> => {
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
      await result.receipt();
      enqueueSnackbar('Minting operation sent', { variant: 'info' });
      set(operationByHashState(op.transactionHash), markAsDone(op));
      return result.opHash;
    }
  );

  const buildFullSignature = (signatures: Record<string, string>) => {
    const orderedSigners = Object.keys(signatures).sort();
    return orderedSigners.reduce(
      (previousValue, currentValue) =>
        previousValue + signatures[currentValue].replace('0x', ''),
      '0x'
    );
  };

  const unlockErc20 = useRecoilCallback(
    ({ set }) => async (op: UnwrapErc20Operation): Promise<string> => {
      if (op.status.type !== StatusType.READY) {
        return Promise.reject('Operation is not ready');
      }
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
      set(operationByHashState(op.operationHash), markAsDone(op));

      return result.blockHash;
    }
  );

  return { addOperation, mintErc20, unlockErc20 };
}

export const pendingOperationsCount = selector({
  key: OperationsCountKey,
  get: ({ get }) => {
    const operations = get(pendingOperationsState);
    return operations.mints.length + operations.burns.length;
  },
});

export const useOperationsPolling = () => {
  const indexerApi = useIndexerApi();

  const [operations, setOperations] = useRecoilState(pendingOperationsState);

  const { fees, wrapSignatureThreshold } = useConfig();

  const {
    ethereum: { account: ethAccount },
    tezos: { account: tzAccount },
  } = useWalletContext();

  const setOp: (op: Operation) => Promise<Operation> = useRecoilCallback(
    ({ snapshot, set }) => async (op: Operation) => {
      const old = await snapshot.getPromise(operationByHashState(op.hash));

      const value = mergeSingle(op, old);
      set(operationByHashState(op.hash), value);
      return value;
    }
  );

  useEffect(() => {
    const loadPendingWrap = async () => {
      if (!ethAccount && !tzAccount) {
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
      const mints = await Promise.all(mintsFromIndexer.map(setOp));
      const burns = await Promise.all(burnsFromIndexer.map(setOp));
      setOperations({
        mints: mints.map((o) => o.hash),
        burns: burns.map((o) => o.hash),
      });
    };
    // noinspection JSIgnoredPromiseFromCall
    loadPendingWrap();
    const intervalId = setInterval(loadPendingWrap, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethAccount, tzAccount]);

  return { operations };
};
