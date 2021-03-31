import BigNumber from 'bignumber.js';

export enum OperationType {
  WRAP,
  UNWRAP,
}

export enum StatusType {
  NEW = 'NEW',
  WAITING_FOR_CONFIRMATIONS = 'WAITING_CONFIRMATIONS',
  WAITING_FOR_SIGNATURES = 'WAITING_SIGNATURES',
  READY = 'READY',
  DONE = 'DONE',
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
  | New
  | WaitingForConfirmations
  | WaitingForSignatures
  | Ready
  | Done;

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
