import BigNumber from 'bignumber.js';

export enum OperationType {
  WRAP,
  UNWRAP,
}

export enum StatusType {
  WAITING_FOR_RECEIPT = 'WAITING_FOR_RECEIPT',
  NEW = 'NEW',
  WAITING_FOR_CONFIRMATIONS = 'WAITING_CONFIRMATIONS',
  WAITING_FOR_SIGNATURES = 'WAITING_SIGNATURES',
  READY = 'READY',
  DONE = 'DONE',
}

export interface WaitingForReceipt {
  type: StatusType.WAITING_FOR_RECEIPT;
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

export interface Done {
  type: StatusType.DONE;
  id: string;
}

export type OperationStatus =
  | WaitingForReceipt
  | New
  | WaitingForConfirmations
  | WaitingForSignatures
  | Ready
  | Done;

export interface BaseOperation {
  type: OperationType;
  status: OperationStatus;
  hash: string;
  source: string;
  destination: string;
  token: string;
  fees: BigNumber;
}

export interface WrapErc20Operation extends BaseOperation {
  type: OperationType.WRAP;
  amount: BigNumber;
  transactionHash: string;
}

export interface UnwrapErc20Operation extends BaseOperation {
  type: OperationType.UNWRAP;
  amount: BigNumber;
  operationHash: string;
}

export type Operation = WrapErc20Operation | UnwrapErc20Operation;
