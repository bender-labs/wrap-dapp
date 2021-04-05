import { useRecoilCallback, useRecoilState } from 'recoil';
import { operationByHashState } from '../state/pendingOperations';
import { useWalletContext } from '../../../runtime/wallet/WalletContext';
import {
  useConfig,
  useIndexerApi,
} from '../../../runtime/config/ConfigContext';
import { useEffect } from 'react';
import {
  StatusType,
  UnwrapErc20Operation,
  WrapErc20Operation,
} from '../state/types';
import {
  markAsDone,
  markAsNew,
  mergeSingle,
  wrapsToOperations,
} from '../state/operation';
import { ethers } from 'ethers';
import CUSTODIAN_ABI from '../../ethereum/custodianContractAbi';
import ERC20_ABI from '../../ethereum/erc20Abi';

export const useOperation = (hash: string) => {
  const {
    tezos: { library: tzLibrary },
    ethereum: { library: ethLibrary },
  } = useWalletContext();
  const indexerApi = useIndexerApi();

  const {
    fees,
    wrapSignatureThreshold,
    fungibleTokens,
    tezos: { quorumContractAddress, minterContractAddress },
    ethereum: { custodianContractAddress },
  } = useConfig();

  const [operation, setOp] = useRecoilState(operationByHashState(hash));

  useEffect(() => {
    const fetchReceipt = async () => {
      await ethLibrary?.getTransactionReceipt(hash);
      setOp(markAsNew(operation!));
    };
    if (
      operation?.status.type === StatusType.WAITING_FOR_RECEIPT &&
      ethLibrary
    ) {
      // noinspection JSIgnoredPromiseFromCall
      fetchReceipt();
    }
    // eslint-disable-next-line
  }, [hash, operation, ethLibrary]);

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
          op.amount.toFixed(),
          minterContractAddress,
          mintSignatures
        )
        .send();
      await result.receipt();
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

  return { operation, fungibleTokens, mintErc20, unlockErc20 };
};
