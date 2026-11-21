/**
 * OBTENTIK - Next.js React Context & Provider
 * Manages reactive wallet connection, Polygon Amoy network verification,
 * user role state, and provides seamless methods for both read-only and write interactions.
 */
import React from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { AddCheckpointInput, BatchDetail, BatchVerificationResult, CheckpointData, RegisterBatchInput, SetBatchRecallInput, TransactionResult, WalletState } from "./types";
export interface ObtentikContextValue extends WalletState {
    provider: BrowserProvider | null;
    signer: JsonRpcSigner | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    switchToAmoy: () => Promise<boolean>;
    refreshRole: () => Promise<void>;
    verifyBatch: (batchId: string) => Promise<BatchVerificationResult>;
    getBatchDetail: (batchId: string) => Promise<BatchDetail>;
    getBatchCheckpoints: (batchId: string) => Promise<CheckpointData[]>;
    getAllBatches: () => Promise<string[]>;
    getBatchCount: () => Promise<number>;
    registerManufacturer: (account: string, name: string) => Promise<TransactionResult>;
    registerDistributor: (account: string, name: string) => Promise<TransactionResult>;
    registerPharmacy: (account: string, name: string) => Promise<TransactionResult>;
    registerBatch: (input: RegisterBatchInput) => Promise<TransactionResult>;
    addCheckpoint: (input: AddCheckpointInput) => Promise<TransactionResult>;
    verifyCheckpoint: (input: AddCheckpointInput) => Promise<TransactionResult>;
    setBatchRecallStatus: (input: SetBatchRecallInput) => Promise<TransactionResult>;
}
export interface ObtentikProviderProps {
    children: React.ReactNode;
    autoConnect?: boolean;
}
export declare const ObtentikProvider: React.FC<ObtentikProviderProps>;
/**
 * Hook to consume ObtentikContext
 */
export declare function useObtentikContext(): ObtentikContextValue;
