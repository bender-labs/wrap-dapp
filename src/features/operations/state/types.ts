import {
  IndexerERC20Payload,
  IndexerWrapPayload,
} from '../../indexer/indexerApi';
import BigNumber from 'bignumber.js';
import { wrapFees } from '../../fees/fees';
import { Fees } from '../../../config';

export enum OperationType {
  WRAP,
  UNWRAP,
}

export enum StatusType {
  NEW = 'NEW',
  WAITING_FOR_CONFIRMATIONS = 'WAITING_CONFIRMATIONS',
  WAITING_FOR_SIGNATURES = 'WAITING_SIGNATURES',
  READY = 'READY',
}

export interface New {
  type: StatusType.NEW;
}

export interface WaitingForConfirmations {
  type: StatusType.WAITING_FOR_CONFIRMATIONS;
  id: string;
  confirmations: number;
  confirmationsThreshold: number;
}

export interface WaitingForSignatures {
  type: StatusType.WAITING_FOR_SIGNATURES;
  id: string;
  signatures: Record<string, string>;
}

export interface Ready {
  type: StatusType.READY;
  id: string;
  signatures: Record<string, string>;
}

export type OperationStatus =
  | New
  | WaitingForConfirmations
  | WaitingForSignatures
  | Ready;

export interface BaseOperation {
  type: OperationType;
  status: OperationStatus;
  transactionHash: string;
  source: string;
  destination: string;
  token: string;
  fees: BigNumber;
}

export interface WrapOperation extends BaseOperation {
  type: OperationType.WRAP;
  amount: BigNumber;
}

export interface UnwrapOperation extends BaseOperation {
  type: OperationType.UNWRAP;
  tokenId: string;
}

export type Operation = WrapOperation | UnwrapOperation;

const operationStatus = (p: IndexerERC20Payload): OperationStatus => {
  if (p.confirmations < p.confirmationsThreshold) {
    return {
      type: StatusType.WAITING_FOR_CONFIRMATIONS,
      id: p.id,
      confirmations: p.confirmations,
      confirmationsThreshold: p.confirmationsThreshold,
    };
  }
  if (Object.keys(p.signatures).length < 1) {
    return {
      type: StatusType.WAITING_FOR_SIGNATURES,
      id: p.id,
      signatures: p.signatures,
    };
  }
  return {
    type: StatusType.READY,
    id: p.id,
    signatures: p.signatures,
  };
};

export const toOperations = (
  fees: Fees,
  payload: IndexerWrapPayload
): Operation[] => {
  return payload.erc20Wraps.map((w) => {
    const amount = new BigNumber(w.amount);
    return {
      status: operationStatus(w),
      type: OperationType.WRAP,
      amount: amount,
      transactionHash: w.transactionHash,
      source: w.source,
      destination: w.destination,
      token: w.token,
      fees: wrapFees(amount, fees),
    };
  });
};
