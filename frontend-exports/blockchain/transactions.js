"use strict";
/**
 * OBTENTIK - Real Transaction Signing Module
 * Executes genuine on-chain write transactions with MetaMask signatures on Polygon Amoy.
 * Strictly no mock or hardcoded simulation data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignerContract = getSignerContract;
exports.registerManufacturer = registerManufacturer;
exports.registerDistributor = registerDistributor;
exports.registerPharmacy = registerPharmacy;
exports.registerBatch = registerBatch;
exports.addCheckpoint = addCheckpoint;
exports.verifyCheckpoint = verifyCheckpoint;
exports.setBatchRecallStatus = setBatchRecallStatus;
const ethers_1 = require("ethers");
const ObtentikConfig_1 = require("../ObtentikConfig");
const chains_1 = require("./chains");
const errors_1 = require("./errors");
const metamask_1 = require("./metamask");
/**
 * Helper to obtain an authenticated contract instance bound to an active signer
 */
async function getSignerContract(explicitSigner) {
    let signer = explicitSigner;
    if (!signer) {
        if (!(0, metamask_1.isMetaMaskInstalled)()) {
            throw new Error("MetaMask tidak terdeteksi untuk melakukan tanda tangan transaksi.");
        }
        const provider = (0, metamask_1.getBrowserProvider)();
        signer = await provider.getSigner();
    }
    const address = (0, chains_1.getContractAddress)();
    return new ethers_1.Contract(address, ObtentikConfig_1.OBTENTIK_ABI, signer);
}
/**
 * Normalizes Date or Unix seconds timestamp into BigInt seconds
 */
function toUnixTimestamp(val) {
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
async function registerManufacturer(account, name, signer) {
    const cleanAccount = account.trim();
    const cleanName = name.trim();
    if (!(0, ethers_1.isAddress)(cleanAccount)) {
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
            explorerUrl: (0, chains_1.getExplorerTxUrl)(receipt.hash),
            receipt,
        };
    }
    catch (error) {
        throw new Error(`Gagal mendaftarkan Manufaktur: ${(0, errors_1.decodeContractError)(error)}`);
    }
}
/**
 * Registers and whitelists an authorized distributor
 * Only callable by ADMIN.
 *
 * @param account Wallet address of the distributor
 * @param name Official registered distributor name
 */
async function registerDistributor(account, name, signer) {
    const cleanAccount = account.trim();
    const cleanName = name.trim();
    if (!(0, ethers_1.isAddress)(cleanAccount)) {
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
            explorerUrl: (0, chains_1.getExplorerTxUrl)(receipt.hash),
            receipt,
        };
    }
    catch (error) {
        throw new Error(`Gagal mendaftarkan Distributor: ${(0, errors_1.decodeContractError)(error)}`);
    }
}
/**
 * Registers and whitelists a licensed pharmacy (Apotek K-24, Kimia Farma Apotek, etc.)
 * Only callable by ADMIN.
 *
 * @param account Wallet address of the pharmacy
 * @param name Official pharmacy facility name
 */
async function registerPharmacy(account, name, signer) {
    const cleanAccount = account.trim();
    const cleanName = name.trim();
    if (!(0, ethers_1.isAddress)(cleanAccount)) {
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
            explorerUrl: (0, chains_1.getExplorerTxUrl)(receipt.hash),
            receipt,
        };
    }
    catch (error) {
        throw new Error(`Gagal mendaftarkan Apotek: ${(0, errors_1.decodeContractError)(error)}`);
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
async function registerBatch(input, signer) {
    const batchId = input.batchId.trim();
    const productName = input.productName.trim();
    const bpomNumber = input.bpomNumber.trim();
    const lotNumber = input.lotNumber.trim();
    const facilityLocation = input.facilityLocation.trim();
    const initialNotes = input.initialNotes?.trim() || "Batch registered and passed Quality Control";
    if (!batchId)
        throw new Error("Batch ID wajib diisi.");
    if (!productName)
        throw new Error("Nama produk obat wajib diisi.");
    if (!bpomNumber)
        throw new Error("Nomor izin edar BPOM wajib diisi.");
    if (!lotNumber)
        throw new Error("Nomor lot produksi wajib diisi.");
    if (!facilityLocation)
        throw new Error("Lokasi fasilitas produksi wajib diisi.");
    const prodDateUnix = toUnixTimestamp(input.productionDate);
    const expDateUnix = toUnixTimestamp(input.expiryDate);
    if (prodDateUnix >= expDateUnix) {
        throw new Error("Tanggal kedaluwarsa harus lebih lama dari tanggal produksi.");
    }
    try {
        const contract = await getSignerContract(signer);
        const tx = await contract.registerBatch(batchId, productName, bpomNumber, lotNumber, prodDateUnix, expDateUnix, facilityLocation, initialNotes);
        const receipt = await tx.wait(1);
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            explorerUrl: (0, chains_1.getExplorerTxUrl)(receipt.hash),
            receipt,
        };
    }
    catch (error) {
        throw new Error(`Gagal mendaftarkan Batch Obat: ${(0, errors_1.decodeContractError)(error)}`);
    }
}
/**
 * Records a supply chain checkpoint transition:
 * - Distributor logs receipt (transitions Manufactured -> Distributed)
 * - Pharmacy logs receipt (transitions Distributed -> AtPharmacy)
 *
 * Enforces strict custody sequence without bypass.
 */
async function addCheckpoint(input, signer) {
    const batchId = input.batchId.trim();
    const location = input.location.trim();
    const notes = input.notes?.trim() || "";
    if (!batchId)
        throw new Error("Batch ID wajib diisi.");
    if (!location)
        throw new Error("Lokasi penerimaan/gudang wajib diisi.");
    try {
        const contract = await getSignerContract(signer);
        const tx = await contract.addCheckpoint(batchId, location, notes);
        const receipt = await tx.wait(1);
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            explorerUrl: (0, chains_1.getExplorerTxUrl)(receipt.hash),
            receipt,
        };
    }
    catch (error) {
        throw new Error(`Gagal mencatat Checkpoint: ${(0, errors_1.decodeContractError)(error)}`);
    }
}
/**
 * Alias for addCheckpoint matching frontend scanner terminology in project proposal
 */
async function verifyCheckpoint(input, signer) {
    return addCheckpoint(input, signer);
}
/**
 * Sets recall status of a medicine batch (Emergency Safety Action)
 * Only callable by ADMIN or the original MANUFACTURER who registered the batch.
 */
async function setBatchRecallStatus(input, signer) {
    const batchId = input.batchId.trim();
    const recallReason = input.recallReason.trim();
    if (!batchId)
        throw new Error("Batch ID wajib diisi.");
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
            explorerUrl: (0, chains_1.getExplorerTxUrl)(receipt.hash),
            receipt,
        };
    }
    catch (error) {
        throw new Error(`Gagal memperbarui status recall batch: ${(0, errors_1.decodeContractError)(error)}`);
    }
}
