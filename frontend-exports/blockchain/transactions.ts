/**
 * OBTENTIK - Real Transaction Signing Module
 * Executes genuine on-chain write transactions with MetaMask signatures on Polygon Amoy.
 * Strictly no mock or hardcoded simulation data.
 */

import { Contract, JsonRpcSigner, isAddress } from "ethers";
import { OBTENTIK_ABI } from "../ObtentikConfig";
import { getContractAddress, getExplorerTxUrl } from "./chains";
import { decodeContractError } from "./errors";
import { getBrowserProvider, isMetaMaskInstalled, switchToPolygonAmoy } from "./metamask";
import {
  AddCheckpointInput,
  RegisterBatchInput,
  SetBatchRecallInput,
  TransactionResult,
} from "./types";

/**
 * Helper to obtain an authenticated contract instance bound to an active signer
 */
export async function getSignerContract(explicitSigner?: JsonRpcSigner): Promise<Contract> {
  let signer = explicitSigner;

  if (!signer) {
    if (!isMetaMaskInstalled()) {
      throw new Error("MetaMask tidak terdeteksi untuk melakukan tanda tangan transaksi.");
    }
    const provider = getBrowserProvider();
    signer = await provider.getSigner();
  }

  const address = getContractAddress();
  return new Contract(address, OBTENTIK_ABI, signer);
}

/**
 * Normalizes Date or Unix seconds timestamp into BigInt seconds
 */
function toUnixTimestamp(val: number | Date): bigint {
  if (val instanceof Date) {
    return BigInt(Math.floor(val.getTime() / 1000));
  }
  // If value is in milliseconds (greater than year 2100 epoch in seconds: 4102444800)
  if (val > 4102444800) {
    return BigInt(Math.floor(val / 1000));
  }
  return BigInt(Math.floor(val));
}

// ============================================================================
// ADMIN WHITELIST TRANSACTIONS
// ============================================================================

/**
 * Registers and whitelists a pharmaceutical manufacturer (PT Kimia Farma, etc.)
 * Only callable by ADMIN.
 *
 * @param account Wallet address of the manufacturer
 * @param name Official registered company name
 */
export async function registerManufacturer(
  account: string,
  name: string,
  signer?: JsonRpcSigner
): Promise<TransactionResult> {
  const cleanAccount = account.trim();
  const cleanName = name.trim();

  if (!isAddress(cleanAccount)) {
    throw new Error("Alamat dompet (account) tidak valid.");
  }
  if (!cleanName) {
    throw new Error("Nama manufaktur farmasi tidak boleh kosong.");
  }

  try {
    const contract = await getSignerContract(signer);
    const tx = await contract.registerManufacturer(cleanAccount, cleanName);
    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getExplorerTxUrl(receipt.hash),
      receipt,
    };
  } catch (error: any) {
    throw new Error(`Gagal mendaftarkan Manufaktur: ${decodeContractError(error)}`);
  }
}

/**
 * Registers and whitelists an authorized distributor
 * Only callable by ADMIN.
 *
 * @param account Wallet address of the distributor
 * @param name Official registered distributor name
 */
export async function registerDistributor(
  account: string,
  name: string,
  signer?: JsonRpcSigner
): Promise<TransactionResult> {
  const cleanAccount = account.trim();
  const cleanName = name.trim();

  if (!isAddress(cleanAccount)) {
    throw new Error("Alamat dompet (account) tidak valid.");
  }
  if (!cleanName) {
    throw new Error("Nama distributor resmi tidak boleh kosong.");
  }

  try {
    const contract = await getSignerContract(signer);
    const tx = await contract.registerDistributor(cleanAccount, cleanName);
    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getExplorerTxUrl(receipt.hash),
      receipt,
    };
  } catch (error: any) {
    throw new Error(`Gagal mendaftarkan Distributor: ${decodeContractError(error)}`);
  }
}

/**
 * Registers and whitelists a licensed pharmacy (Apotek K-24, Kimia Farma Apotek, etc.)
 * Only callable by ADMIN.
 *
 * @param account Wallet address of the pharmacy
 * @param name Official pharmacy facility name
 */
export async function registerPharmacy(
  account: string,
  name: string,
  signer?: JsonRpcSigner
): Promise<TransactionResult> {
  const cleanAccount = account.trim();
  const cleanName = name.trim();

  if (!isAddress(cleanAccount)) {
    throw new Error("Alamat dompet (account) tidak valid.");
  }
  if (!cleanName) {
    throw new Error("Nama apotek berlisensi tidak boleh kosong.");
  }

  try {
    const contract = await getSignerContract(signer);
    const tx = await contract.registerPharmacy(cleanAccount, cleanName);
    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getExplorerTxUrl(receipt.hash),
      receipt,
    };
  } catch (error: any) {
    throw new Error(`Gagal mendaftarkan Apotek: ${decodeContractError(error)}`);
  }
}

// ============================================================================
// SUPPLY CHAIN CORE TRANSACTIONS
// ============================================================================

/**
 * Registers a new medicine batch on Polygon Amoy blockchain
 * Automatically records Checkpoint 1 (Manufactured).
 * Only callable by MANUFACTURER or ADMIN.
 */
export async function registerBatch(
  input: RegisterBatchInput,
  signer?: JsonRpcSigner
): Promise<TransactionResult> {
  const batchId = input.batchId.trim();
  const productName = input.productName.trim();
  const bpomNumber = input.bpomNumber.trim();
  const lotNumber = input.lotNumber.trim();
  const facilityLocation = input.facilityLocation.trim();
  const initialNotes = input.initialNotes?.trim() || "Batch registered and passed Quality Control";

  if (!batchId) throw new Error("Batch ID wajib diisi.");
  if (!productName) throw new Error("Nama produk obat wajib diisi.");
  if (!bpomNumber) throw new Error("Nomor izin edar BPOM wajib diisi.");
  if (!lotNumber) throw new Error("Nomor lot produksi wajib diisi.");
  if (!facilityLocation) throw new Error("Lokasi fasilitas produksi wajib diisi.");

  const prodDateUnix = toUnixTimestamp(input.productionDate);
  const expDateUnix = toUnixTimestamp(input.expiryDate);

  if (prodDateUnix >= expDateUnix) {
    throw new Error("Tanggal kedaluwarsa harus lebih lama dari tanggal produksi.");
  }

  try {
    const contract = await getSignerContract(signer);
    const tx = await contract.registerBatch(
      batchId,
      productName,
      bpomNumber,
      lotNumber,
      prodDateUnix,
      expDateUnix,
      facilityLocation,
      initialNotes
    );

    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getExplorerTxUrl(receipt.hash),
      receipt,
    };
  } catch (error: any) {
    throw new Error(`Gagal mendaftarkan Batch Obat: ${decodeContractError(error)}`);
  }
}

/**
 * Records a supply chain checkpoint transition:
 * - Distributor logs receipt (transitions Manufactured -> Distributed)
 * - Pharmacy logs receipt (transitions Distributed -> AtPharmacy)
 *
 * Enforces strict custody sequence without bypass.
 */
export async function addCheckpoint(
  input: AddCheckpointInput,
  signer?: JsonRpcSigner
): Promise<TransactionResult> {
  const batchId = input.batchId.trim();
  const location = input.location.trim();
  const notes = input.notes?.trim() || "";

  if (!batchId) throw new Error("Batch ID wajib diisi.");
  if (!location) throw new Error("Lokasi penerimaan/gudang wajib diisi.");

  try {
    const contract = await getSignerContract(signer);
    const tx = await contract.addCheckpoint(batchId, location, notes);
    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getExplorerTxUrl(receipt.hash),
      receipt,
    };
  } catch (error: any) {
    throw new Error(`Gagal mencatat Checkpoint: ${decodeContractError(error)}`);
  }
}

/**
 * Alias for addCheckpoint matching frontend scanner terminology in project proposal
 */
export async function verifyCheckpoint(
  input: AddCheckpointInput,
  signer?: JsonRpcSigner
): Promise<TransactionResult> {
  return addCheckpoint(input, signer);
}

/**
 * Sets recall status of a medicine batch (Emergency Safety Action)
 * Only callable by ADMIN or the original MANUFACTURER who registered the batch.
 */
export async function setBatchRecallStatus(
  input: SetBatchRecallInput,
  signer?: JsonRpcSigner
): Promise<TransactionResult> {
  const batchId = input.batchId.trim();
  const recallReason = input.recallReason.trim();

  if (!batchId) throw new Error("Batch ID wajib diisi.");
  if (input.isRecalled && !recallReason) {
    throw new Error("Alasan penarikan obat (recallReason) wajib dijelaskan.");
  }

  try {
    const contract = await getSignerContract(signer);
    const tx = await contract.setBatchRecallStatus(batchId, input.isRecalled, recallReason);
    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getExplorerTxUrl(receipt.hash),
      receipt,
    };
  } catch (error: any) {
    throw new Error(`Gagal memperbarui status recall batch: ${decodeContractError(error)}`);
  }
}
