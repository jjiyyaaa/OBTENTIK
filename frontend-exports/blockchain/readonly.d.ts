/**
 * OBTENTIK - Read-Only Blockchain Service
 * Provides public, gasless, zero-wallet query methods for Consumers and Frontends.
 * Uses ethers.js JsonRpcProvider connected to Polygon Amoy Testnet.
 */
import { Contract, JsonRpcProvider } from "ethers";
import { BatchDetail, BatchVerificationResult, CheckpointData, SupplyChainStageName, UserRole } from "./types";
/**
 * Converts enum integer to friendly name
 */
export declare function getStageName(stage: number): SupplyChainStageName;
/**
 * Creates or retrieves a reliable Read-Only JsonRpcProvider for Polygon Amoy
 */
export declare function getReadOnlyProvider(forceNew?: boolean): JsonRpcProvider;
/**
 * Rotates to the next public RPC endpoint in case of rate limits or failures
 */
export declare function rotateReadOnlyProvider(): JsonRpcProvider;
/**
 * Returns a read-only instance of the ObtentikSupplyChain contract
 */
export declare function getReadOnlyContract(): Contract;
/**
 * Formats unix timestamp into readable Indonesian date string
 */
export declare function formatUnixDate(timestamp: number | bigint): string;
/**
 * 1. Verify Batch for Consumers scanning QR Code
 * Free, instantaneous, zero-wallet call directly to Polygon Amoy.
 *
 * @param batchId Unique identifier from QR code (e.g. "BATCH-2026-PARA500")
 */
export declare function verifyBatch(batchId: string): Promise<BatchVerificationResult>;
/**
 * 2. Get full details of a medicine batch
 *
 * @param batchId Unique identifier from QR code
 */
export declare function getBatchDetail(batchId: string): Promise<BatchDetail>;
/**
 * 3. Get complete chronological checkpoint timeline for a batch
 *
 * @param batchId Unique batch identifier
 */
export declare function getBatchCheckpoints(batchId: string): Promise<CheckpointData[]>;
/**
 * 4. Get registered actor official corporate/facility name
 *
 * @param account Wallet address of actor
 */
export declare function getActorName(account: string): Promise<string>;
/**
 * 5. Get primary role of an address
 *
 * @param account Wallet address to inspect
 * @returns "ADMIN" | "MANUFACTURER" | "DISTRIBUTOR" | "PHARMACY" | "CONSUMER"
 */
export declare function getUserRole(account: string): Promise<UserRole>;
/**
 * 6. Get total number of registered batches
 */
export declare function getBatchCount(): Promise<number>;
/**
 * 7. Get list of all registered batch IDs
 */
export declare function getAllBatches(): Promise<string[]>;
