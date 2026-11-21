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
  Search,
  Sparkles,
  Award,
  Wallet,
  Calendar,
} from "lucide-react";
import { BatchDetail } from "@/frontend-exports/blockchain/types";
import { getExplorerTxUrl } from "@/frontend-exports";

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

  const [activeTab, setActiveTab] = useState<"batchList" | "registerBatch" | "whitelist" | "recall">(
    "batchList"
  );

  // Batches state for table and management
  const [batches, setBatches] = useState<BatchDetail[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [batchLoadError, setBatchLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // QR Modal State
  const [selectedBatchForQr, setSelectedBatchForQr] = useState<BatchDetail | null>(null);

  // Transaction Feedback State
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txSuccessMsg, setTxSuccessMsg] = useState<string | null>(null);
  const [txExplorerUrl, setTxExplorerUrl] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Form: Register Batch
  const [batchForm, setBatchForm] = useState({
    batchId: "",
    productName: "",
    bpomNumber: "",
    lotNumber: "",
    productionDate: "",
    expiryDate: "",
    facilityLocation: "",
    initialNotes: "",
  });

  // Helper to generate a new unique Batch ID
  const generateNewBatchId = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const year = new Date().getFullYear();
    setBatchForm((prev) => ({
      ...prev,
      batchId: `BATCH-${year}-OBT${randomSuffix}`,
      lotNumber: `LOT-${year}-${randomSuffix}`,
    }));
  };

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
    recallReason: "",
  });

  // Load all batches on chain
  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      setBatchLoadError(null);
      const batchIds = await getAllBatches();
      const details: BatchDetail[] = [];
      for (let index = 0; index < batchIds.length; index += 5) {
        const page = await Promise.all(
          batchIds.slice(index, index + 5).map((id) => getBatchDetail(id))
        );
        details.push(...page);
      }
      setBatches(details);
    } catch (err) {
      console.warn("Could not load batches:", err);
      const message =
        err instanceof Error ? err.message : "Gagal memuat data batch dari Polygon Amoy.";
      setBatchLoadError(
        message === "Failed to fetch"
          ? "Tidak dapat menghubungi RPC Polygon Amoy. Periksa koneksi internet, VPN, atau firewall, lalu coba muat ulang."
          : message
      );
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
      const prodDate = Date.parse(`${batchForm.productionDate}T00:00:00.000Z`);
      const expDate = Date.parse(`${batchForm.expiryDate}T00:00:00.000Z`);
      if (!Number.isFinite(prodDate) || !Number.isFinite(expDate)) {
        throw new Error("Tanggal produksi dan kedaluwarsa harus diisi dengan tanggal yang valid.");
      }

      const result = await registerBatch({
        batchId: batchForm.batchId,
        productName: batchForm.productName,
        bpomNumber: batchForm.bpomNumber,
        lotNumber: batchForm.lotNumber,
        productionDate: Math.floor(prodDate / 1000),
        expiryDate: Math.floor(expDate / 1000),
        facilityLocation: batchForm.facilityLocation,
        initialNotes: batchForm.initialNotes,
      });

      setTxSuccessMsg(`Batch obat ${batchForm.batchId} berhasil didaftarkan di blok #${result.blockNumber}!`);
      setTxExplorerUrl(result.explorerUrl);
      fetchBatches();
      setActiveTab("batchList");
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
        `Berhasil mendaftarkan ${whitelistForm.name} sebagai ${whitelistForm.roleType === "MANUFACTURER" ? "produsen" : whitelistForm.roleType === "DISTRIBUTOR" ? "distributor" : "apotek"} di blok #${result.blockNumber}!`
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

  // Quick Recall Shortcut from Table
  const triggerQuickRecall = (batchId: string) => {
    setRecallForm({
      batchId,
      isRecalled: true,
      recallReason: "",
    });
    setActiveTab("recall");
    clearTxStatus();
  };

  const isAdmin = role === "ADMIN";
  const isManufacturer = role === "MANUFACTURER";
  const canRegisterBatch = isAdmin || isManufacturer;
  const roleLabel =
    role === "ADMIN"
      ? "Regulator"
      : role === "MANUFACTURER"
        ? "Produsen"
        : role === "DISTRIBUTOR"
          ? "Distributor"
          : role === "PHARMACY"
            ? "Apotek"
            : role === "CONSUMER"
              ? "Konsumen"
              : "Peran belum tersedia";

  // Filtered batches for table search
  const filteredBatches = batches.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.batchId.toLowerCase().includes(q) ||
      b.productName.toLowerCase().includes(q) ||
      b.bpomNumber.toLowerCase().includes(q)
    );
  });

  // Calculate live preview dates for registration form
  const formatDateField = (value: string) =>
    value
      ? new Date(`${value}T00:00:00.000Z`).toLocaleDateString("id-ID", {
          dateStyle: "medium",
          timeZone: "UTC",
        })
      : "—";
  const computedProdDate = formatDateField(batchForm.productionDate);
  const computedExpDate = formatDateField(batchForm.expiryDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Administrative SaaS Hero Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-medical-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-navy-900 text-cyan-300 rounded-2xl shadow-sm">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Dashboard Admin & Tata Kelola Rantai Pasok
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Pusat pengelolaan izin rantai pasok farmasi, pendaftaran batch obat, pencetakan kode QR kemasan, dan tindakan darurat penarikan di jaringan uji Polygon Amoy.
          </p>
        </div>

        {/* Current Role & Connect Card */}
        <div className="bg-surface-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-center min-w-[260px] shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Status kewenangan dompet
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <RoleBadge role={role} size="md" />
            {actorName && (
              <span className="text-xs font-bold text-navy-900 truncate max-w-[130px]" title={actorName}>
                {actorName}
              </span>
            )}
          </div>
          {!isConnected ? (
            <button
              onClick={() => connect()}
              disabled={isConnecting}
              className="mt-3 w-full bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm"
            >
              Hubungkan MetaMask
            </button>
          ) : !isCorrectNetwork ? (
            <button
              onClick={() => switchToAmoy()}
              className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm"
            >
              Beralih ke Polygon Amoy
            </button>
          ) : null}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Batch Obat</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 font-mono">
            {loadingBatches ? "..." : batchLoadError ? "—" : batches.length}
          </div>
          <div className="text-[11px] text-slate-500">Terdaftar pada kontrak pintar</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hak Akses Aktif</span>
            <Award className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-sm font-bold text-navy-900 pt-1">
            {role === "ADMIN" ? "Regulator penuh" : role === "MANUFACTURER" ? "Pabrik farmasi" : roleLabel}
          </div>
          <div className="text-[11px] text-slate-500">
            {canRegisterBatch ? "Dapat mendaftarkan batch baru" : "Akses terbatas (pemindai/konsumen)"}
          </div>
        </div>
      </div>

      {/* Main SaaS Dashboard Container: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navy Desktop Sidebar */}
        <div className="lg:col-span-3 bg-navy-900 rounded-3xl p-5 text-white shadow-medical-lg space-y-6">
          <div>
            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mb-2">
              Modul Administrasi
            </div>
            <nav className="space-y-1.5">
              <button
                onClick={() => {
                  setActiveTab("batchList");
                  clearTxStatus();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition text-left ${
                  activeTab === "batchList"
                    ? "bg-teal-500 text-navy-950 shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Daftar Batch & QR</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "batchList" ? "bg-navy-900 text-teal-300 font-mono" : "bg-navy-800 text-slate-400"}`}>
                  {batches.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("registerBatch");
                  clearTxStatus();
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition text-left ${
                  activeTab === "registerBatch"
                    ? "bg-teal-500 text-navy-950 shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrasi Batch Obat</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("whitelist");
                  clearTxStatus();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition text-left ${
                  activeTab === "whitelist"
                    ? "bg-teal-500 text-navy-950 shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Izin pelaku</span>
                </div>
                {isAdmin && <span className="text-[10px] text-teal-300 bg-navy-800 px-1.5 py-0.5 rounded">Admin</span>}
              </button>

              <button
                onClick={() => {
                  setActiveTab("recall");
                  clearTxStatus();
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition text-left ${
                  activeTab === "recall"
                    ? "bg-rose-600 text-white shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white"
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Penarikan obat</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-navy-800/80 text-[11px] text-slate-400 space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Keamanan Kriptografis</span>
            </div>
            <p className="leading-relaxed">
              Setiap pendaftaran batch langsung mencatat <strong>titik pemeriksaan pertama (produksi)</strong> secara permanen di blockchain Polygon Amoy.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Transaction Alerts */}
          {txSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{txSuccessMsg}</span>
              </div>
              {txExplorerUrl && (
                <a
                  href={txExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition shrink-0"
                >
                  <span>Lihat di Polygonscan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {txError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Transaksi Gagal:</div>
                <div className="text-xs text-rose-800 mt-1 font-mono">{txError}</div>
              </div>
            </div>
          )}

          {/* TAB 1: Batch List & QR Generator */}
          {activeTab === "batchList" && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-extrabold text-navy-900">
                    Daftar seluruh batch yang terdaftar pada kontrak pintar
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data diambil langsung dari jaringan uji Polygon Amoy. Klik <strong>Kode QR</strong> untuk mengunduh label kemasan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchBatches()}
                    disabled={loadingBatches}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-surface-50 border border-slate-200 hover:bg-slate-100 transition shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingBatches ? "animate-spin text-teal-600" : ""}`} />
                    <span>Muat ulang data</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("registerBatch");
                      clearTxStatus();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white transition shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Daftarkan batch baru</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari berdasarkan ID batch, nama produk, atau nomor BPOM..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 border border-slate-200 text-xs font-medium focus:bg-white"
                />
              </div>

              {loadingBatches ? (
                <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2.5">
                  <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
                  <span className="font-semibold text-slate-600">Membaca data batch dari kontrak pintar Polygon Amoy...</span>
                </div>
              ) : batchLoadError ? (
                <div role="alert" className="py-10 text-center text-sm text-rose-800 bg-rose-50 rounded-2xl border border-rose-200 p-8">
                  Gagal membaca batch dari Polygon Amoy: {batchLoadError}
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 bg-surface-50 rounded-2xl border border-slate-200 p-8">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">
                    {batches.length === 0
                      ? "Belum ada batch obat yang didaftarkan pada kontrak ini."
                      : "Tidak ditemukan batch yang sesuai kata kunci pencarian."}
                  </p>
                  <p className="mt-1">
                    Gunakan tab <strong>Registrasi Batch Obat</strong> untuk mendaftarkan batch pertama Anda.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">ID batch</th>
                        <th className="py-3 px-4">Nama Produk Farmasi</th>
                        <th className="py-3 px-4">No. BPOM</th>
                        <th className="py-3 px-4">Status Rantai Pasok</th>
                        <th className="py-3 px-4">Kedaluwarsa</th>
                        <th className="py-3 px-4">Integritas</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBatches.map((b) => (
                        <tr key={b.batchId} className="hover:bg-slate-50/90 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                            {b.batchId}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-navy-900">
                            {b.productName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            {b.bpomNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block bg-surface-100 text-slate-800 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border border-slate-200">
                              {b.currentStageLabel} ({b.checkpointCount} titik)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {b.expiryDateFormatted}
                          </td>
                          <td className="py-3.5 px-4">
                            {b.isRecalled ? (
                              <span className="bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded text-[10px] border border-rose-200">
                                DITARIK
                              </span>
                            ) : b.isExpired ? (
                              <span className="bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded text-[10px] border border-amber-200">
                                KEDALUWARSA
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                BERLAKU
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedBatchForQr(b)}
                              className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-1.5 rounded-xl transition border border-teal-200"
                              title="Buat dan unduh kode QR kemasan"
                            >
                              <QrCode className="w-3.5 h-3.5 text-teal-600" />
                              <span>QR Code</span>
                            </button>
                            {!b.isRecalled && (isAdmin || isManufacturer) && (
                              <button
                                onClick={() => triggerQuickRecall(b.batchId)}
                                className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1.5 rounded-xl transition border border-rose-200 text-[11px]"
                                title="Tindakan recall batch"
                              >
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                                <span>Tarik</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Register Batch Form */}
          {activeTab === "registerBatch" && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-extrabold text-navy-900">
                    Pendaftaran Batch Obat Baru ke Blockchain
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mencatat identitas fisik obat dan secara otomatis menambahkan <strong>titik pemeriksaan pertama: produksi</strong> ke blockchain.
                  </p>
                </div>
                {!canRegisterBatch && (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                    Hanya produsen atau regulator yang berhak mendaftarkan batch
                  </span>
                )}
              </div>

              <form onSubmit={handleRegisterBatch} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        ID Batch Unik (Batch ID) *
                      </label>
                      <button
                        type="button"
                        onClick={generateNewBatchId}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Buat ID baru</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={batchForm.batchId}
                      onChange={(e) => setBatchForm({ ...batchForm, batchId: e.target.value })}
                      placeholder="contoh: BATCH-2026-PARA500"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:bg-white"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Akan dicantumkan dalam kode QR pada label kemasan obat.
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:bg-white"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:bg-white"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Produksi *
                    </label>
                    <input
                      type="date"
                      required
                      value={batchForm.productionDate}
                      onChange={(e) =>
                        setBatchForm({ ...batchForm, productionDate: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:bg-white"
                    />
                    <span className="text-[11px] text-teal-700 mt-1 block font-semibold">
                      Terhitung: {computedProdDate}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Kedaluwarsa *
                    </label>
                    <input
                      type="date"
                      required
                      value={batchForm.expiryDate}
                      onChange={(e) =>
                        setBatchForm({ ...batchForm, expiryDate: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:bg-white"
                    />
                    <span className="text-[11px] text-teal-700 mt-1 block font-semibold">
                      Terhitung: {computedExpDate}
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:bg-white"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={txSubmitting || !canRegisterBatch}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-navy-900 via-navy-800 to-teal-700 hover:from-navy-850 hover:to-teal-600 active:scale-95 text-white text-xs font-bold px-8 py-3.5 rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {txSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                        <span>Menandatangani transaksi...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-cyan-300" />
                        <span>Daftarkan batch obat di Polygon Amoy</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Whitelist Management (Admin Only) */}
          {activeTab === "whitelist" && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-extrabold text-navy-900">
                    Pendaftaran hak akses pelaku rantai pasok
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Memberi izin kepada dompet Web3 entitas terverifikasi (pabrik farmasi, distributor PBF, apotek) untuk berpartisipasi di blockchain.
                  </p>
                </div>
                {!isAdmin && (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                    Fitur ini hanya dapat dieksekusi oleh DEFAULT_ADMIN_ROLE (Regulator)
                  </span>
                )}
              </div>

              <form onSubmit={handleWhitelistSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Peran dalam rantai pasok *
                    </label>
                    <select
                      value={whitelistForm.roleType}
                      onChange={(e: any) =>
                        setWhitelistForm({ ...whitelistForm, roleType: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-navy-900 focus:bg-white"
                    >
                      <option value="MANUFACTURER">Produsen (Pabrik Farmasi)</option>
                      <option value="DISTRIBUTOR">Distributor (PBF Resmi)</option>
                      <option value="PHARMACY">Apotek berizin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Alamat dompet entitas *
                    </label>
                    <input
                      type="text"
                      required
                      value={whitelistForm.targetAccount}
                      onChange={(e) =>
                        setWhitelistForm({ ...whitelistForm, targetAccount: e.target.value })
                      }
                      placeholder="0x..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:bg-white"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={txSubmitting || !isAdmin}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-navy-900 via-navy-800 to-teal-700 hover:from-navy-850 hover:to-teal-600 active:scale-95 text-white text-xs font-bold px-8 py-3 rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {txSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                        <span>Mendaftarkan izin...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4 text-cyan-300" />
                        <span>Berikan izin kepada pelaku rantai pasok</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Batch Recall Management */}
          {activeTab === "recall" && (
            <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="pb-4 border-b border-rose-100">
                <h2 className="text-xl font-extrabold text-rose-950 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  <span>Tindakan darurat: penarikan batch obat</span>
                </h2>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Fungsi ini menetapkan status <strong>DITARIK</strong> secara permanen di blockchain. Seluruh pencatatan titik pemeriksaan berikutnya akan diblokir otomatis oleh kontrak pintar, dan konsumen yang memindai kode QR akan segera menerima peringatan. Hanya dapat dijalankan oleh <strong>regulator</strong> atau <strong>produsen batch</strong> terkait.
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Status penarikan
                    </label>
                    <select
                      value={recallForm.isRecalled ? "true" : "false"}
                      onChange={(e) =>
                        setRecallForm({ ...recallForm, isRecalled: e.target.value === "true" })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-rose-800 bg-rose-50"
                    >
                      <option value="true">DITARIK DARI PEREDARAN</option>
                      <option value="false">BATALKAN PENARIKAN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alasan resmi penarikan *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={recallForm.recallReason}
                    onChange={(e) => setRecallForm({ ...recallForm, recallReason: e.target.value })}
                    placeholder="Jelaskan alasan penarikan (misal: Temuan kontaminasi BKO, kerusakan stabilitas mutu, dsb.)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={txSubmitting || (!isAdmin && !isManufacturer)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold px-8 py-3 rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {txSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Mengirim perintah penarikan ke blockchain...</span>
                      </>
                    ) : (
                      <>
                        <AlertOctagon className="w-4 h-4 text-white" />
                        <span>Jalankan perintah penarikan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

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
