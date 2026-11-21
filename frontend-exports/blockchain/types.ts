/**
 * OBTENTIK - Blockchain Types Definition
 * Polygon Amoy Testnet (Chain ID 80002 / 0x13882)
 * Smart Contract: ObtentikSupplyChain
 */

import type { TransactionReceipt } from "ethers";

/**
 * Stakeholder Roles in OBTENTIK Supply Chain
 */
export type UserRole =
  | "ADMIN"
  | "MANUFACTURER"
  | "DISTRIBUTOR"
  | "PHARMACY"
  | "CONSUMER";

/**
 * Supply chain stages corresponding to ObtentikSupplyChain.SupplyChainStage enum
 */
export enum SupplyChainStage {
  Manufactured = 0,
  Distributed = 1,
  AtPharmacy = 2,
}

export type SupplyChainStageName = "Manufactured" | "Distributed" | "AtPharmacy";

/**
 * Human-readable mapping for supply chain stages
 */
export const STAGE_LABELS: Record<SupplyChainStage, string> = {
  [SupplyChainStage.Manufactured]: "Diproduksi (Manufacturer)",
  [SupplyChainStage.Distributed]: "Didistribusikan (Distributor)",
  [SupplyChainStage.AtPharmacy]: "Tersedia di Apotek (Pharmacy)",
};

/**
 * Checkpoint timeline entry
 */
export interface CheckpointData {
  stage: SupplyChainStage;
  stageName: SupplyChainStageName;
  stageLabel: string;
  actor: string;
  actorRole: "MANUFACTURER" | "DISTRIBUTOR" | "PHARMACY" | string;
  actorName: string;
  location: string;
  notes: string;
  timestamp: number;
  timestampDate: Date;
  timestampFormatted: string;
}

/**
 * Verification result for consumers scanning QR Code (No wallet needed)
 */
export interface BatchVerificationResult {
  batchId: string;
  isValid: boolean;
  isAuthentic: boolean;
  isRecalled: boolean;
  isExpired: boolean;
  currentStage: SupplyChainStage;
  currentStageName: SupplyChainStageName;
  currentStageLabel: string;
  statusMessage: string;
  checkpointCount: number;
  isSafeForConsumption: boolean;
}

/**
 * Full detail of a registered medicine batch
 */
export interface BatchDetail {
  batchId: string;
  productName: string;
  bpomNumber: string;
  lotNumber: string;
  productionDate: number;
  productionDateFormatted: string;
  expiryDate: number;
  expiryDateFormatted: string;
  manufacturer: string;
  currentStage: SupplyChainStage;
  currentStageName: SupplyChainStageName;
  currentStageLabel: string;
  isRecalled: boolean;
  recallReason: string;
  checkpointCount: number;
  registeredAt: number;
  registeredAtFormatted: string;
  isExpired: boolean;
}

/**
 * Input parameters to register a new medicine batch (Manufacturer/Admin)
 */
export interface RegisterBatchInput {
  batchId: string;
  productName: string;
  bpomNumber: string;
  lotNumber: string;
  productionDate: number | Date; // unix epoch in seconds or Date object
  expiryDate: number | Date;     // unix epoch in seconds or Date object
  facilityLocation: string;
  initialNotes?: string;
}

/**
 * Input parameters to record a new checkpoint (Distributor/Pharmacy)
 */
export interface AddCheckpointInput {
  batchId: string;
  location: string;
  notes?: string;
}

/**
 * Input parameters to recall or restore a batch (Manufacturer/Admin)
 */
export interface SetBatchRecallInput {
  batchId: string;
  isRecalled: boolean;
  recallReason: string;
}

/**
 * Standard transaction execution result
 */
export interface TransactionResult {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  explorerUrl: string;
  receipt?: TransactionReceipt;
  errorMessage?: string;
}

/**
 * Wallet state for MetaMask connection
 */
export interface WalletState {
  account: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  role: UserRole;
  actorName: string;
  error: string | null;
}
