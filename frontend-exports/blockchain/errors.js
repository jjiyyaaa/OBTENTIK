/**
 * OBTENTIK - Contract Custom Error Decoder (ESM)
 */
import { Interface } from "ethers";
import { OBTENTIK_ABI } from "../ObtentikConfig.js";

const contractInterface = new Interface(OBTENTIK_ABI);

export const ERROR_MESSAGES_ID = {
  BatchAlreadyExists: "Batch ID ini sudah terdaftar sebelumnya di blockchain.",
  BatchNotFound: "Batch ID tidak ditemukan di rantai pasok blockchain OBTENTIK.",
  BatchAlreadyRecalled: "Batch ini telah ditarik dari peredaran (RECALLED). Penambahan checkpoint baru diblokir.",
  InvalidDates: "Tanggal kedaluwarsa harus lebih lama dari tanggal produksi obat.",
  EmptyStringNotAllowed: "Field teks wajib diisi dan tidak boleh dibiarkan kosong.",
  InvalidSupplyChainSequence: "Pelanggaran urutan rantai pasok: Distributor harus menerima sebelum Apotek, dan urutan tidak boleh dipotong.",
  UnauthorizedActor: "Dompet Anda tidak memiliki wewenang atau lisensi yang sesuai untuk aksi ini.",
  ZeroAddressNotAllowed: "Alamat dompet 0x0 tidak diizinkan.",
  AccessControlUnauthorizedAccount: "Akses ditolak: Akun Anda tidak memiliki role administratif yang dibutuhkan.",
  AccessControlBadConfirmation: "Konfirmasi akses tidak valid.",
};

export function decodeContractError(error) {
  if (!error) return "Terjadi kesalahan yang tidak diketahui.";

  // 1. User rejected transaction in MetaMask
  if (error.code === 4001 || error.code === "ACTION_REJECTED") {
    return "Transaksi dibatalkan oleh pengguna di MetaMask.";
  }

  // 2. Insufficient funds for gas
  if (
    error.code === "INSUFFICIENT_FUNDS" ||
    error.message?.includes("insufficient funds")
  ) {
    return "Saldo token POL/MATIC di dompet Anda tidak mencukupi untuk membayar biaya gas transaksi.";
  }

  // 3. Network connection issues
  if (error.code === "NETWORK_ERROR" || error.message?.includes("could not detect network")) {
    return "Gagal terhubung ke RPC Polygon Amoy. Periksa koneksi internet atau coba beberapa saat lagi.";
  }

  // 4. Try parsing custom error from reverted tx data
  try {
    const errorData =
      error.data ||
      error.error?.data ||
      error.info?.error?.data ||
      error.transaction?.data;

    if (errorData && typeof errorData === "string" && errorData.startsWith("0x")) {
      const parsedError = contractInterface.parseError(errorData);
      if (parsedError && ERROR_MESSAGES_ID[parsedError.name]) {
        return ERROR_MESSAGES_ID[parsedError.name];
      }
    }
  } catch (parseErr) {
    // ignore
  }

  // 5. Check if error message contains known names
  const rawMsg = error.message || error.reason || (typeof error === "string" ? error : "");
  for (const [key, msg] of Object.entries(ERROR_MESSAGES_ID)) {
    if (rawMsg.includes(key)) {
      return msg;
    }
  }

  return rawMsg || "Terjadi kesalahan pada eksekusi smart contract.";
}
