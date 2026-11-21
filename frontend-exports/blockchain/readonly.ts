/**
 * OBTENTIK - Read-Only Blockchain Service
 * Provides public, gasless, zero-wallet query methods for Consumers and Frontends.
 * Uses ethers.js JsonRpcProvider connected to Polygon Amoy Testnet.
 */

import { Contract, FetchRequest, JsonRpcProvider } from "ethers";
import { OBTENTIK_ABI } from "../ObtentikConfig";
import {
  POLYGON_AMOY_CHAIN,
  getContractAddress,
  getPublicRpcUrl,
  getPublicRpcUrlCount,
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
 * Reuses JsonRpcProvider instances per endpoint so concurrent reads can fail over safely
 */
const cachedProviders = new Map<string, JsonRpcProvider>();
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
  const rpcUrl = getPublicRpcUrl(currentRpcIndex);
  const cachedProvider = cachedProviders.get(rpcUrl);
  if (cachedProvider && !forceNew) {
    return cachedProvider;
  }
  cachedProvider?.destroy();

  const request = new FetchRequest(rpcUrl);
  request.timeout = 15_000;
  request.setThrottleParams({ maxAttempts: 1 });
  const provider = new JsonRpcProvider(request, {
    chainId: POLYGON_AMOY_CHAIN.chainId,
    name: "polygon-amoy",
  }, {
    staticNetwork: true,
  });
  cachedProviders.set(rpcUrl, provider);

  return provider;
}

/**
 * Rotates to the next public RPC endpoint in case of rate limits or failures
 */
export function rotateReadOnlyProvider(): JsonRpcProvider {
  currentRpcIndex = (currentRpcIndex + 1) % getPublicRpcUrlCount();
  return getReadOnlyProvider();
}

/**
 * Returns a read-only instance of the ObtentikSupplyChain contract
 */
export function getReadOnlyContract(): Contract {
  const provider = getReadOnlyProvider();
  const address = getContractAddress();
  return new Contract(address, OBTENTIK_ABI, provider);
}

async function withReadOnlyFallback<T>(
  read: (contract: Contract) => Promise<T>
): Promise<T> {
  let lastError: unknown;
  const rpcCount = getPublicRpcUrlCount();

  for (let attempt = 0; attempt < rpcCount; attempt += 1) {
    if (attempt > 0) {
      rotateReadOnlyProvider();
    }

    try {
      return await read(getReadOnlyContract());
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Semua endpoint RPC Polygon Amoy gagal diakses.");
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

  const result = await withReadOnlyFallback((contract) =>
    contract.verifyBatch(cleanId)
  );
  const isValid = Boolean(result[0]);
  const isAuthentic = Boolean(result[1]);
  const isRecalled = Boolean(result[2]);
  const isExpired = Boolean(result[3]);
  const currentStage = Number(result[4]) as SupplyChainStage;
  const statusMessage = String(result[5]);
  const checkpointCount = Number(result[6]);
  const stageName = getStageName(currentStage);
  const stageLabel = STAGE_LABELS[currentStage] || "Tidak Diketahui";

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
    isSafeForConsumption: isValid && isAuthentic && !isRecalled && !isExpired,
  };
}

/**
 * 2. Get full details of a medicine batch
 *
 * @param batchId Unique identifier from QR code
 */
export async function getBatchDetail(batchId: string): Promise<BatchDetail> {
  const cleanId = batchId.trim();
  const result = await withReadOnlyFallback((contract) =>
    contract.getBatchDetail(cleanId)
  );

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
  const rawCheckpoints = await withReadOnlyFallback((contract) =>
    contract.getBatchCheckpoints(cleanId)
  );

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
  if (!account || !account.startsWith("0x")) {
    throw new Error("Alamat akun tidak valid untuk membaca nama aktor.");
  }
  return withReadOnlyFallback((contract) => contract.actorNames(account));
}

/**
 * 5. Get primary role of an address
 *
 * @param account Wallet address to inspect
 * @returns "ADMIN" | "MANUFACTURER" | "DISTRIBUTOR" | "PHARMACY" | "CONSUMER"
 */
export async function getUserRole(account: string): Promise<UserRole> {
  if (!account || !account.startsWith("0x")) {
    throw new Error("Alamat akun tidak valid untuk membaca peran.");
  }
  const role = String(
    await withReadOnlyFallback((contract) => contract.getUserRole(account))
  );
  if (
    role !== "ADMIN" &&
    role !== "MANUFACTURER" &&
    role !== "DISTRIBUTOR" &&
    role !== "PHARMACY" &&
    role !== "CONSUMER"
  ) {
    throw new Error(`Peran on-chain tidak dikenal: ${role}`);
  }
  return role;
}

/**
 * 6. Get total number of registered batches
 */
export async function getBatchCount(): Promise<number> {
  const count = await withReadOnlyFallback((contract) => contract.getBatchCount());
  return Number(count);
}

/**
 * 7. Get list of all registered batch IDs
 */
export async function getAllBatches(): Promise<string[]> {
  const batches = await withReadOnlyFallback((contract) => contract.getAllBatches());
  return Array.from(batches);
}
