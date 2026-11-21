"use client";

import React, { useEffect, useState } from "react";
import { useObtentik } from "@/frontend-exports";
import RoleBadge from "@/components/RoleBadge";
import QrModal from "@/components/QrModal";
import {
  Shield,
  Factory,
  Truck,
  Store,
  PlusCircle,
  AlertOctagon,
  QrCode,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Clock,
  Layers,
} from "lucide-react";
import { BatchDetail } from "@/frontend-exports/blockchain/types";
import { getExplorerTxUrl, getExplorerAddressUrl } from "@/frontend-exports/blockchain/chains";

export default function AdminManufacturerDashboard() {
  const {
    account,
    role,
    actorName,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    connect,
    switchToAmoy,
    registerBatch,
    setBatchRecallStatus,
    registerManufacturer,
    registerDistributor,
    registerPharmacy,
    getAllBatches,
    getBatchDetail,
  } = useObtentik();

  const [activeTab, setActiveTab] = useState<"registerBatch" | "whitelist" | "recall" | "batchList">(
    "registerBatch"
  );

  // Batches state for table and management
  const [batches, setBatches] = useState<BatchDetail[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // QR Modal State
  const [selectedBatchForQr, setSelectedBatchForQr] = useState<BatchDetail | null>(null);

  // Transaction Feedback State
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txSuccessMsg, setTxSuccessMsg] = useState<string | null>(null);
  const [txExplorerUrl, setTxExplorerUrl] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Form: Register Batch
  const [batchForm, setBatchForm] = useState({
    batchId: "BATCH-2026-PARA500",
    productName: "Paracetamol 500mg Kaplet",
    bpomNumber: "DKL1234567890A1",
    lotNumber: "LOT-202604-01",
    productionDaysAgo: 2,
    expiryYearsAhead: 3,
    facilityLocation: "Pabrik PT Kimia Farma Plant Banjaran, Bandung",
    initialNotes: "Passed BPOM Good Manufacturing Practice (CPOB) standards",
  });

  // Form: Whitelist Actor (Admin only)
  const [whitelistForm, setWhitelistForm] = useState({
    targetAccount: "",
    name: "",
    roleType: "MANUFACTURER" as "MANUFACTURER" | "DISTRIBUTOR" | "PHARMACY",
  });

  // Form: Recall Batch
  const [recallForm, setRecallForm] = useState({
    batchId: "",
    isRecalled: true,
    recallReason: "Peringatan mutu BPOM: Terindikasi kerusakan segel kemasan sekunder",
  });

  // Load all batches on chain
  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const batchIds = await getAllBatches();
      const details = await Promise.all(
        batchIds.map(async (id) => {
          try {
            return await getBatchDetail(id);
          } catch {
            return null;
          }
        })
      );
      setBatches(details.filter((d): d is BatchDetail => d !== null));
    } catch (err) {
      console.warn("Could not load batches:", err);
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const clearTxStatus = () => {
    setTxSuccessMsg(null);
    setTxExplorerUrl(null);
    setTxError(null);
  };

  // Submit Handler: Register Batch
  const handleRegisterBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    clearTxStatus();
    setTxSubmitting(true);

    try {
      const now = Math.floor(Date.now() / 1000);
      const prodDate = now - batchForm.productionDaysAgo * 86400;
      const expDate = now + batchForm.expiryYearsAhead * 365 * 86400;

      const result = await registerBatch({
        batchId: batchForm.batchId,
        productName: batchForm.productName,
        bpomNumber: batchForm.bpomNumber,
        lotNumber: batchForm.lotNumber,
        productionDate: prodDate,
        expiryDate: expDate,
        facilityLocation: batchForm.facilityLocation,
        initialNotes: batchForm.initialNotes,
      });

      setTxSuccessMsg(`Batch obat ${batchForm.batchId} berhasil didaftarkan di blok #${result.blockNumber}!`);
      setTxExplorerUrl(result.explorerUrl);
      fetchBatches();
    } catch (err: any) {
      setTxError(err.message || "Gagal mendaftarkan batch obat.");
    } finally {
      setTxSubmitting(false);
    }
  };

  // Submit Handler: Whitelist Actor
  const handleWhitelistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearTxStatus();
    setTxSubmitting(true);

    try {
      let result;
      if (whitelistForm.roleType === "MANUFACTURER") {
        result = await registerManufacturer(whitelistForm.targetAccount, whitelistForm.name);
      } else if (whitelistForm.roleType === "DISTRIBUTOR") {
        result = await registerDistributor(whitelistForm.targetAccount, whitelistForm.name);
      } else {
        result = await registerPharmacy(whitelistForm.targetAccount, whitelistForm.name);
      }

      setTxSuccessMsg(
        `Berhasil mendaftarkan ${whitelistForm.name} sebagai ${whitelistForm.roleType} di blok #${result.blockNumber}!`
      );
      setTxExplorerUrl(result.explorerUrl);
      setWhitelistForm({ targetAccount: "", name: "", roleType: "MANUFACTURER" });
    } catch (err: any) {
      setTxError(err.message || "Gagal mendaftarkan aktor whitelist.");
    } finally {
      setTxSubmitting(false);
    }
  };

  // Submit Handler: Set Recall Status
  const handleRecallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearTxStatus();
    setTxSubmitting(true);

    try {
      const result = await setBatchRecallStatus({
        batchId: recallForm.batchId,
        isRecalled: recallForm.isRecalled,
        recallReason: recallForm.recallReason,
      });

      setTxSuccessMsg(
        `Status penarikan batch ${recallForm.batchId} berhasil diperbarui di blok #${result.blockNumber}!`
      );
      setTxExplorerUrl(result.explorerUrl);
      fetchBatches();
    } catch (err: any) {
      setTxError(err.message || "Gagal memperbarui status recall.");
    } finally {
      setTxSubmitting(false);
    }
  };

  const isAdmin = role === "ADMIN";
  const isManufacturer = role === "MANUFACTURER";
  const canRegisterBatch = isAdmin || isManufacturer;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Role Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-medical-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard Admin & Produsen Farmasi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Pusat tata kelola izin rantai pasok, registrasi batch obat baru, penerbitan QR Code kemasan, dan tindakan darurat recall on-chain di Polygon Amoy Testnet.
          </p>
        </div>

        {/* Current Role Card */}
        <div className="bg-surface-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-center min-w-[240px]">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Status Hak Akses Anda</div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <RoleBadge role={role} size="md" />
            {actorName && (
              <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]" title={actorName}>
                {actorName}
              </span>
            )}
          </div>
          {!isConnected ? (
            <button
              onClick={() => connect()}
              disabled={isConnecting}
              className="mt-3 w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 rounded-xl transition"
            >
              Hubungkan MetaMask
            </button>
          ) : !isCorrectNetwork ? (
            <button
              onClick={() => switchToAmoy()}
              className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-xl transition"
            >
              Beralih ke Polygon Amoy
            </button>
          ) : null}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setActiveTab("registerBatch");
            clearTxStatus();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "registerBatch"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrasi Batch Obat (registerBatch)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("batchList");
            clearTxStatus();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "batchList"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Daftar Batch & QR Code ({batches.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("whitelist");
            clearTxStatus();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "whitelist"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Kelola Whitelist Role {isAdmin ? "★" : "(Admin)"}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("recall");
            clearTxStatus();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "recall"
              ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Penarikan Obat (Recall)</span>
        </button>
      </div>

      {/* Transaction Status Alerts */}
      {txSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{txSuccessMsg}</span>
          </div>
          {txExplorerUrl && (
            <a
              href={txExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition"
            >
              <span>Lihat di Polygonscan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {txError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Transaksi Gagal:</div>
            <div className="text-xs text-rose-800 mt-1 font-mono">{txError}</div>
          </div>
        </div>
      )}

      {/* TAB 1: Register Batch */}
      {activeTab === "registerBatch" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pendaftaran Batch Obat Baru ke Blockchain
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mencatat identitas fisik obat dan secara otomatis membubuhkan <strong>Checkpoint 1: Manufactured</strong> on-chain.
              </p>
            </div>
            {!canRegisterBatch && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                Hanya role MANUFACTURER atau ADMIN yang berhak mendaftarkan batch
              </span>
            )}
          </div>

          <form onSubmit={handleRegisterBatch} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ID Batch Unik (Batch ID) *
                </label>
                <input
                  type="text"
                  required
                  value={batchForm.batchId}
                  onChange={(e) => setBatchForm({ ...batchForm, batchId: e.target.value })}
                  placeholder="contoh: BATCH-2026-PARA500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Akan dienkode ke QR Code kemasan obat.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Resmi Produk Obat *
                </label>
                <input
                  type="text"
                  required
                  value={batchForm.productName}
                  onChange={(e) => setBatchForm({ ...batchForm, productName: e.target.value })}
                  placeholder="contoh: Paracetamol 500mg Kaplet"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Registrasi / Izin Edar BPOM *
                </label>
                <input
                  type="text"
                  required
                  value={batchForm.bpomNumber}
                  onChange={(e) => setBatchForm({ ...batchForm, bpomNumber: e.target.value })}
                  placeholder="contoh: DKL1234567890A1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Lot Pabrik *
                </label>
                <input
                  type="text"
                  required
                  value={batchForm.lotNumber}
                  onChange={(e) => setBatchForm({ ...batchForm, lotNumber: e.target.value })}
                  placeholder="contoh: LOT-202604-01"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hari Lalu Tanggal Produksi
                </label>
                <input
                  type="number"
                  min="0"
                  value={batchForm.productionDaysAgo}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, productionDaysAgo: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Nilai 0 = Hari ini. 2 = Dua hari lalu.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Masa Kedaluwarsa (Tahun ke Depan)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={batchForm.expiryYearsAhead}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, expiryYearsAhead: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Standar obat umum 2-3 tahun kedepan.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lokasi Fasilitas Produksi (Pabrik Farmasi) *
              </label>
              <input
                type="text"
                required
                value={batchForm.facilityLocation}
                onChange={(e) => setBatchForm({ ...batchForm, facilityLocation: e.target.value })}
                placeholder="contoh: Pabrik PT Kimia Farma Plant Banjaran, Bandung"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catatan Mutu / Standar CPOB Awal
              </label>
              <textarea
                rows={2}
                value={batchForm.initialNotes}
                onChange={(e) => setBatchForm({ ...batchForm, initialNotes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={txSubmitting || !canRegisterBatch}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-bold px-8 py-3.5 rounded-2xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
              >
                {txSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menandatangani Transaksi on-chain...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Daftarkan Batch Obat ke Polygon Amoy</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Batch List & QR Generator */}
      {activeTab === "batchList" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Seluruh Batch Terdaftar di Smart Contract
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Diambil langsung secara on-chain dari Polygon Amoy Testnet. Klik <strong>Lihat & Unduh QR</strong> untuk mencetak label kemasan obat.
              </p>
            </div>
            <button
              onClick={() => fetchBatches()}
              disabled={loadingBatches}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-surface-50 border border-slate-200 hover:bg-slate-100 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBatches ? "animate-spin" : ""}`} />
              <span>Muat Ulang On-Chain</span>
            </button>
          </div>

          {loadingBatches ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
              <span>Membaca data batch dari smart contract Polygon Amoy...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-surface-50 rounded-2xl border border-slate-200 p-8">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Belum ada batch obat yang didaftarkan.</p>
              <p className="mt-1">Gunakan tab <strong>Registrasi Batch Obat</strong> di atas untuk mendaftarkan batch pertama Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Batch ID</th>
                    <th className="py-3 px-3">Nama Produk</th>
                    <th className="py-3 px-3">No. BPOM</th>
                    <th className="py-3 px-3">Status Rantai Pasok</th>
                    <th className="py-3 px-3">Kedaluwarsa</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((b) => (
                    <tr key={b.batchId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-brand-700">
                        {b.batchId}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        {b.productName}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">
                        {b.bpomNumber}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                          {b.currentStageLabel} ({b.checkpointCount} titik)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-700">
                        {b.expiryDateFormatted}
                      </td>
                      <td className="py-3.5 px-3">
                        {b.isRecalled ? (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            RECALLED
                          </span>
                        ) : b.isExpired ? (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            EXPIRED
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            VALID
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedBatchForQr(b)}
                          className="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold px-2.5 py-1.5 rounded-lg transition"
                          title="Generate & Unduh QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Whitelist Management (Admin Only) */}
      {activeTab === "whitelist" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pendaftaran Hak Akses Aktor Rantai Pasok (Whitelist)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengizinkan dompet Web3 entitas terverifikasi (Pabrik Farmasi, Distributor PBF, Apotek) untuk berpartisipasi on-chain.
              </p>
            </div>
            {!isAdmin && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                Fitur ini hanya dapat dieksekusi oleh DEFAULT_ADMIN_ROLE (Regulator)
              </span>
            )}
          </div>

          <form onSubmit={handleWhitelistSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Peran Rantai Pasok (Role) *
                </label>
                <select
                  value={whitelistForm.roleType}
                  onChange={(e: any) =>
                    setWhitelistForm({ ...whitelistForm, roleType: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                >
                  <option value="MANUFACTURER">MANUFACTURER (Pabrik Farmasi)</option>
                  <option value="DISTRIBUTOR">DISTRIBUTOR (PBF Resmi)</option>
                  <option value="PHARMACY">PHARMACY (Apotek Berlisensi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Dompet Entitas (Wallet Address) *
                </label>
                <input
                  type="text"
                  required
                  value={whitelistForm.targetAccount}
                  onChange={(e) =>
                    setWhitelistForm({ ...whitelistForm, targetAccount: e.target.value })
                  }
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Resmi Instansi / Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  value={whitelistForm.name}
                  onChange={(e) =>
                    setWhitelistForm({ ...whitelistForm, name: e.target.value })
                  }
                  placeholder="contoh: PT Kimia Farma Tbk"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={txSubmitting || !isAdmin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-bold px-8 py-3 rounded-2xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
              >
                {txSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Whitelist on-chain...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Daftarkan Aktor ke Whitelist Blockchain</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Batch Recall Management */}
      {activeTab === "recall" && (
        <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-rose-100">
            <h2 className="text-lg font-bold text-rose-950 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              Tindakan Darurat: Penarikan Batch Obat (Batch Recall)
            </h2>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Fungsi ini menerbitkan status <strong>RECALL</strong> permanen on-chain. Seluruh pencatatan checkpoint berikutnya akan diblokir secara otomatis oleh smart contract, dan konsumen yang memindai QR code akan menerima peringatan bahaya seketika. Hanya dapat dipanggil oleh <strong>ADMIN</strong> atau <strong>Pabrik pembuat batch</strong> terkait.
            </p>
          </div>

          <form onSubmit={handleRecallSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ID Batch yang Akan Ditarik *
                </label>
                <input
                  type="text"
                  required
                  value={recallForm.batchId}
                  onChange={(e) => setRecallForm({ ...recallForm, batchId: e.target.value })}
                  placeholder="contoh: BATCH-2026-PARA500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status Recall
                </label>
                <select
                  value={recallForm.isRecalled ? "true" : "false"}
                  onChange={(e) =>
                    setRecallForm({ ...recallForm, isRecalled: e.target.value === "true" })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-rose-700 bg-rose-50"
                >
                  <option value="true">DITARIK DARI PEREDARAN (Recalled: TRUE)</option>
                  <option value="false">BATALKAN PENARIKAN (Recalled: FALSE)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alasan Penarikan Resmi On-Chain *
              </label>
              <textarea
                rows={3}
                required
                value={recallForm.recallReason}
                onChange={(e) => setRecallForm({ ...recallForm, recallReason: e.target.value })}
                placeholder="Jelaskan alasan penarikan (misal: Temuan kontaminasi BKO, kerusakan stabilitas mutu, dsb.)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={txSubmitting || (!isAdmin && !isManufacturer)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold px-8 py-3 rounded-2xl shadow-md shadow-rose-500/20 transition disabled:opacity-50"
              >
                {txSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim transaksi recall ke blockchain...</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-4 h-4" />
                    <span>Eksekusi Perintah Recall On-Chain</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QR Code Modal Generator */}
      {selectedBatchForQr && (
        <QrModal
          batch={selectedBatchForQr}
          isOpen={Boolean(selectedBatchForQr)}
          onClose={() => setSelectedBatchForQr(null)}
        />
      )}
    </div>
  );
}
