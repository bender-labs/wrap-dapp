import { atom, selector, useRecoilState, useSetRecoilState } from 'recoil';
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
  merge,
  unwrapToOperations,
  wrapsToOperations,
} from './operation';
import { ethers } from 'ethers';
import CUSTODIAN_ABI from '../../ethereum/custodianContractAbi';
import ERC20_ABI from '../../ethereum/erc20Abi';

export const OperationStateKey = 'OPERATIONS_STATE';
export const OperationsCountKey = 'OPERATIONS_COUNT';

export const operationsState = atom<{ mints: Operation[]; burns: Operation[] }>(
  {
    key: OperationStateKey,
    default: { mints: [], burns: [] },
  }
);

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
  let setOperations = useSetRecoilState(operationsState);

  const addOperation = (o: Operation) => {
    setOperations((p) => {
      switch (o.type) {
        case OperationType.WRAP:
          return { ...p, mints: [...p.mints, o] };
        case OperationType.UNWRAP:
          return { ...p, burns: [...p.burns, o] };
      }
    });
  };

  const mintErc20 = async (op: WrapErc20Operation): Promise<string> => {
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
    setOperations((curr) => {
      const mints = curr.mints.map((v) =>
        v.hash === op.hash ? markAsDone(op) : v
      );
      return { ...curr, mints };
    });
    return result.opHash;
  };

  const buildFullSignature = (signatures: Record<string, string>) => {
    const orderedSigners = Object.keys(signatures).sort();
    return orderedSigners.reduce(
      (previousValue, currentValue) =>
        previousValue + signatures[currentValue].replace('0x', ''),
      '0x'
    );
  };

  const unlockErc20 = async (op: UnwrapErc20Operation): Promise<string> => {
    if (op.status.type !== StatusType.READY) {
      return Promise.reject('Operation is not ready');
    }
    const custodianContract = new ethers.Contract(
      custodianContractAddress,
      new ethers.utils.Interface(CUSTODIAN_ABI),
      ethLibrary.getSigner()
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
    setOperations((curr) => {
      const burns = curr.burns.map((v) =>
        v.hash === op.hash ? markAsDone(op) : v
      );
      return { ...curr, burns };
    });
    return result.blockHash;
  };

  return { addOperation, mintErc20, unlockErc20 };
}

export const pendingOperationsCount = selector({
  key: OperationsCountKey,
  get: ({ get }) => {
    const operations = get(operationsState);
    return operations.mints.length + operations.burns.length;
  },
});

export const useOperationsPolling = () => {
  const indexerApi = useIndexerApi();

  const [operations, setOperations] = useRecoilState(operationsState);

  const { fees, wrapSignatureThreshold } = useConfig();

  const {
    ethereum: { account: ethAccount },
    tezos: { account: tzAccount },
  } = useWalletContext();

  useEffect(() => {
    const loadPendingWrap = async () => {
      if (!ethAccount && !tzAccount) {
        return;
      }

      const [pendingWrap, pendingUnwrap] = await Promise.all([
        indexerApi.fetchPendingWrap(ethAccount, tzAccount),
        indexerApi.fetchPendingUnwrap(ethAccount, tzAccount),
      ]);

      setOperations(({ mints, burns }) => {
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
        return {
          mints: merge(mints, mintsFromIndexer),
          burns: merge(burns, burnsFromIndexer),
        };
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
