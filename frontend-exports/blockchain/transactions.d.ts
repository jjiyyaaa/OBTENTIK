/**
 * OBTENTIK - Real Transaction Signing Module
 * Executes genuine on-chain write transactions with MetaMask signatures on Polygon Amoy.
 * Strictly no mock or hardcoded simulation data.
 */
import { Contract, JsonRpcSigner } from "ethers";
import { AddCheckpointInput, RegisterBatchInput, SetBatchRecallInput, TransactionResult } from "./types";
/**
 * Helper to obtain an authenticated contract instance bound to an active signer
 */
export declare function getSignerContract(explicitSigner?: JsonRpcSigner): Promise<Contract>;
/**
 * Registers and whitelists a pharmaceutical manufacturer (PT Kimia Farma, etc.)
 * Only callable by ADMIN.
 *
 * @param account Wallet address of the manufacturer
 * @param name Official registered company name
 */
export declare function registerManufacturer(account: string, name: string, signer?: JsonRpcSigner): Promise<TransactionResult>;
/**
 * Registers and whitelists an authorized distributor
 * Only callable by ADMIN.
 *
 * @param account Wallet address of the distributor
 * @param name Official registered distributor name
 */
export declare function registerDistributor(account: string, name: string, signer?: JsonRpcSigner): Promise<TransactionResult>;
/**
 * Registers and whitelists a licensed pharmacy (Apotek K-24, Kimia Farma Apotek, etc.)
 * Only callable by ADMIN.
 *
 * @param account Wallet address of the pharmacy
 * @param name Official pharmacy facility name
 */
export declare function registerPharmacy(account: string, name: string, signer?: JsonRpcSigner): Promise<TransactionResult>;
/**
 * Registers a new medicine batch on Polygon Amoy blockchain
 * Automatically records Checkpoint 1 (Manufactured).
 * Only callable by MANUFACTURER or ADMIN.
 */
export declare function registerBatch(input: RegisterBatchInput, signer?: JsonRpcSigner): Promise<TransactionResult>;
/**
 * Records a supply chain checkpoint transition:
 * - Distributor logs receipt (transitions Manufactured -> Distributed)
 * - Pharmacy logs receipt (transitions Distributed -> AtPharmacy)
 *
 * Enforces strict custody sequence without bypass.
 */
export declare function addCheckpoint(input: AddCheckpointInput, signer?: JsonRpcSigner): Promise<TransactionResult>;
/**
 * Alias for addCheckpoint matching frontend scanner terminology in project proposal
 */
export declare function verifyCheckpoint(input: AddCheckpointInput, signer?: JsonRpcSigner): Promise<TransactionResult>;
/**
 * Sets recall status of a medicine batch (Emergency Safety Action)
 * Only callable by ADMIN or the original MANUFACTURER who registered the batch.
 */
export declare function setBatchRecallStatus(input: SetBatchRecallInput, signer?: JsonRpcSigner): Promise<TransactionResult>;
