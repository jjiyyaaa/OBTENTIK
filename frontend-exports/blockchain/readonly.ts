/**
 * OBTENTIK - Read-Only Blockchain Service
 * Provides public, gasless, zero-wallet query methods for Consumers and Frontends.
 * Uses ethers.js JsonRpcProvider connected to Polygon Amoy Testnet.
 */

import { Contract, JsonRpcProvider } from "ethers";
import { OBTENTIK_ABI } from "../ObtentikConfig";
import {
  POLYGON_AMOY_CHAIN,
  getContractAddress,
  getPublicRpcUrl,
} from "./chains";
import {
  BatchDetail,
  BatchVerificationResult,
  CheckpointData,
  STAGE_LABELS,
  SupplyChainStage,
  SupplyChainStageName,
  UserRole,
} from "./types";

/**
 * Singleton or dynamically created JsonRpcProvider with fallback mechanism
 */
let cachedProvider: JsonRpcProvider | null = null;
let currentRpcIndex = 0;

/**
 * Converts enum integer to friendly name
 */
export function getStageName(stage: number): SupplyChainStageName {
  switch (Number(stage)) {
    case 0:
      return "Manufactured";
    case 1:
      return "Distributed";
    case 2:
      return "AtPharmacy";
    default:
      return "Manufactured";
  }
}

/**
 * Creates or retrieves a reliable Read-Only JsonRpcProvider for Polygon Amoy
 */
export function getReadOnlyProvider(forceNew = false): JsonRpcProvider {
  if (cachedProvider && !forceNew) {
    return cachedProvider;
  }

  const rpcUrl = getPublicRpcUrl(currentRpcIndex);
  cachedProvider = new JsonRpcProvider(rpcUrl, {
    chainId: POLYGON_AMOY_CHAIN.chainId,
    name: "polygon-amoy",
  });

  return cachedProvider;
}

/**
 * Rotates to the next public RPC endpoint in case of rate limits or failures
 */
export function rotateReadOnlyProvider(): JsonRpcProvider {
  currentRpcIndex = (currentRpcIndex + 1) % POLYGON_AMOY_CHAIN.rpcUrls.length;
  cachedProvider = new JsonRpcProvider(getPublicRpcUrl(currentRpcIndex), {
    chainId: POLYGON_AMOY_CHAIN.chainId,
    name: "polygon-amoy",
  });
  return cachedProvider;
}

/**
 * Returns a read-only instance of the ObtentikSupplyChain contract
 */
export function getReadOnlyContract(): Contract {
  const provider = getReadOnlyProvider();
  const address = getContractAddress();
  return new Contract(address, OBTENTIK_ABI, provider);
}

/**
 * Formats unix timestamp into readable Indonesian date string
 */
export function formatUnixDate(timestamp: number | bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// ============================================================================
// PUBLIC READ-ONLY FUNCTIONS (NO WALLET / NO LOGIN REQUIRED)
// ============================================================================

/**
 * 1. Verify Batch for Consumers scanning QR Code
 * Free, instantaneous, zero-wallet call directly to Polygon Amoy.
 *
 * @param batchId Unique identifier from QR code (e.g. "BATCH-2026-PARA500")
 */
export async function verifyBatch(batchId: string): Promise<BatchVerificationResult> {
  const cleanId = batchId.trim();
  if (!cleanId) {
    return {
      batchId: "",
      isValid: false,
      isAuthentic: false,
      isRecalled: false,
      isExpired: false,
      currentStage: SupplyChainStage.Manufactured,
      currentStageName: "Manufactured",
      currentStageLabel: STAGE_LABELS[SupplyChainStage.Manufactured],
      statusMessage: "ID Batch tidak boleh kosong.",
      checkpointCount: 0,
      isSafeForConsumption: false,
    };
  }

  try {
    const contract = getReadOnlyContract();
    const result = await contract.verifyBatch(cleanId);

    const isValid = Boolean(result[0]);
    const isAuthentic = Boolean(result[1]);
    const isRecalled = Boolean(result[2]);
    const isExpired = Boolean(result[3]);
    const currentStage = Number(result[4]) as SupplyChainStage;
    const statusMessage = String(result[5]);
    const checkpointCount = Number(result[6]);

    const stageName = getStageName(currentStage);
    const stageLabel = STAGE_LABELS[currentStage] || "Tidak Diketahui";
    const isSafeForConsumption = isValid && isAuthentic && !isRecalled && !isExpired;

    return {
      batchId: cleanId,
      isValid,
      isAuthentic,
      isRecalled,
      isExpired,
      currentStage,
      currentStageName: stageName,
      currentStageLabel: stageLabel,
      statusMessage,
      checkpointCount,
      isSafeForConsumption,
    };
  } catch (error) {
    // If first RPC had a transient error, try rotating once
    try {
      rotateReadOnlyProvider();
      const contract = getReadOnlyContract();
      const result = await contract.verifyBatch(cleanId);
      const isValid = Boolean(result[0]);
      const isAuthentic = Boolean(result[1]);
      const isRecalled = Boolean(result[2]);
      const isExpired = Boolean(result[3]);
      const currentStage = Number(result[4]) as SupplyChainStage;
      const statusMessage = String(result[5]);
      const checkpointCount = Number(result[6]);

      return {
        batchId: cleanId,
        isValid,
        isAuthentic,
        isRecalled,
        isExpired,
        currentStage,
        currentStageName: getStageName(currentStage),
        currentStageLabel: STAGE_LABELS[currentStage],
        statusMessage,
        checkpointCount,
        isSafeForConsumption: isValid && isAuthentic && !isRecalled && !isExpired,
      };
    } catch {
      throw error;
    }
  }
}

/**
 * 2. Get full details of a medicine batch
 *
 * @param batchId Unique identifier from QR code
 */
export async function getBatchDetail(batchId: string): Promise<BatchDetail> {
  const cleanId = batchId.trim();
  const contract = getReadOnlyContract();
  const result = await contract.getBatchDetail(cleanId);

  const batchIdOut = String(result[0]);
  const productName = String(result[1]);
  const bpomNumber = String(result[2]);
  const lotNumber = String(result[3]);
  const productionDate = Number(result[4]);
  const expiryDate = Number(result[5]);
  const manufacturer = String(result[6]);
  const currentStage = Number(result[7]) as SupplyChainStage;
  const isRecalled = Boolean(result[8]);
  const recallReason = String(result[9]);
  const checkpointCount = Number(result[10]);
  const registeredAt = Number(result[11]);

  const nowEpoch = Math.floor(Date.now() / 1000);
  const isExpired = nowEpoch > expiryDate;
  const stageName = getStageName(currentStage);

  return {
    batchId: batchIdOut,
    productName,
    bpomNumber,
    lotNumber,
    productionDate,
    productionDateFormatted: formatUnixDate(productionDate),
    expiryDate,
    expiryDateFormatted: formatUnixDate(expiryDate),
    manufacturer,
    currentStage,
    currentStageName: stageName,
    currentStageLabel: STAGE_LABELS[currentStage],
    isRecalled,
    recallReason,
    checkpointCount,
    registeredAt,
    registeredAtFormatted: formatUnixDate(registeredAt),
    isExpired,
  };
}

/**
 * 3. Get complete chronological checkpoint timeline for a batch
 *
 * @param batchId Unique batch identifier
 */
export async function getBatchCheckpoints(batchId: string): Promise<CheckpointData[]> {
  const cleanId = batchId.trim();
  const contract = getReadOnlyContract();
  const rawCheckpoints = await contract.getBatchCheckpoints(cleanId);

  return rawCheckpoints.map((cp: any) => {
    const stage = Number(cp.stage) as SupplyChainStage;
    const timestamp = Number(cp.timestamp);
    const date = new Date(timestamp * 1000);

    return {
      stage,
      stageName: getStageName(stage),
      stageLabel: STAGE_LABELS[stage] || "Unknown Stage",
      actor: String(cp.actor),
      actorRole: String(cp.actorRole),
      actorName: String(cp.actorName),
      location: String(cp.location),
      notes: String(cp.notes),
      timestamp,
      timestampDate: date,
      timestampFormatted: formatUnixDate(timestamp),
    };
  });
}

/**
 * 4. Get registered actor official corporate/facility name
 *
 * @param account Wallet address of actor
 */
export async function getActorName(account: string): Promise<string> {
  if (!account || !account.startsWith("0x")) return "";
  try {
    const contract = getReadOnlyContract();
    return await contract.actorNames(account);
  } catch {
    return "";
  }
}

/**
 * 5. Get primary role of an address
 *
 * @param account Wallet address to inspect
 * @returns "ADMIN" | "MANUFACTURER" | "DISTRIBUTOR" | "PHARMACY" | "CONSUMER"
 */
export async function getUserRole(account: string): Promise<UserRole> {
  if (!account || !account.startsWith("0x")) return "CONSUMER";
  try {
    const contract = getReadOnlyContract();
    const role = await contract.getUserRole(account);
    return role as UserRole;
  } catch {
    return "CONSUMER";
  }
}

/**
 * 6. Get total number of registered batches
 */
export async function getBatchCount(): Promise<number> {
  try {
    const contract = getReadOnlyContract();
    const count = await contract.getBatchCount();
    return Number(count);
  } catch {
    return 0;
  }
}

/**
 * 7. Get list of all registered batch IDs
 */
export async function getAllBatches(): Promise<string[]> {
  try {
    const contract = getReadOnlyContract();
    const batches = await contract.getAllBatches();
    return Array.from(batches);
  } catch {
    return [];
  }
}
