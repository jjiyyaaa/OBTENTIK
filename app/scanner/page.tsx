"use client";

import React, { useState } from "react";
import { useObtentik } from "@/frontend-exports";
import Html5Scanner from "@/components/Html5Scanner";
import RoleBadge from "@/components/RoleBadge";
import Timeline from "@/components/Timeline";
import {
  QrCode,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MapPin,
  FileText,
  Truck,
  Store,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  BatchDetail,
  BatchVerificationResult,
  CheckpointData,
  SupplyChainStage,
} from "@/frontend-exports/blockchain/types";

export default function VerifierScannerPage() {
  const {
    account,
    role,
    actorName,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    connect,
    switchToAmoy,
    addCheckpoint,
    verifyBatch,
    getBatchDetail,
    getBatchCheckpoints,
  } = useObtentik();

  const [scannedBatchId, setScannedBatchId] = useState("");
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [verification, setVerification] = useState<BatchVerificationResult | null>(null);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Checkpoint Recording Form
  const [locationInput, setLocationInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSuccessMsg, setTxSuccessMsg] = useState<string | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Load batch data once scanned
  const handleBatchScanned = async (rawId: string) => {
    let cleanId = rawId.trim();
    if (cleanId.includes("batchId=")) {
      try {
        const url = new URL(cleanId);
        cleanId = url.searchParams.get("batchId") || cleanId;
      } catch (e) {
        // ignore
      }
    }

    setScannedBatchId(cleanId);
    setLoadingBatch(true);
    setFetchError(null);
    setTxSuccessMsg(null);
    setTxError(null);

    // Auto-fill sensible default locations based on role
    if (role === "DISTRIBUTOR" && !locationInput) {
      setLocationInput(actorName ? `Gudang Distribusi ${actorName}` : "Gudang Distribusi PBF Pusat");
      setNotesInput("Suhu cold-chain 15-25°C terpantau stabil, segel kemasan sekunder utuh.");
    } else if (role === "PHARMACY" && !locationInput) {
      setLocationInput(actorName ? `Fasilitas Farmasi ${actorName}` : "Apotek Pelayanan Kefarmasian");
      setNotesInput("Pemeriksaan fisik sesuai faktur dan surat pesanan resmi, siap didistribusikan ke pasien.");
    }

    try {
      const verResult = await verifyBatch(cleanId);
      setVerification(verResult);

      if (verResult.isValid) {
        const [batchDetail, timeline] = await Promise.all([
          getBatchDetail(cleanId),
          getBatchCheckpoints(cleanId),
        ]);
        setDetail(batchDetail);
        setCheckpoints(timeline);
      } else {
        setDetail(null);
        setCheckpoints([]);
      }
    } catch (err: any) {
      setFetchError(err.message || "Gagal memverifikasi batch di Polygon Amoy.");
    } finally {
      setLoadingBatch(false);
    }
  };

  // Submit on-chain Checkpoint (addCheckpoint / verifyCheckpoint)
  const handleRecordCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBatchId || !locationInput.trim()) return;

    setIsSubmitting(true);
    setTxSuccessMsg(null);
    setTxUrl(null);
    setTxError(null);

    try {
      const result = await addCheckpoint({
        batchId: scannedBatchId,
        location: locationInput.trim(),
        notes: notesInput.trim(),
      });

      setTxSuccessMsg(
        `Checkpoint penerimaan barang berhasil dicatat on-chain di blok #${result.blockNumber}!`
      );
      setTxUrl(result.explorerUrl);

      // Refresh batch data & timeline
      await handleBatchScanned(scannedBatchId);
    } catch (err: any) {
      setTxError(err.message || "Gagal mencatat checkpoint ke smart contract.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDistributor = role === "DISTRIBUTOR";
  const isPharmacy = role === "PHARMACY";
  const isAuthorizedScanner = isDistributor || isPharmacy || role === "ADMIN";

  // Check sequence validity for current role
  const isSequenceValidForRole = () => {
    if (!verification || !verification.isValid) return false;
    if (verification.isRecalled) return false;

    if (isDistributor) {
      // Distributor can only record if current stage is Manufactured (0)
      return verification.currentStage === SupplyChainStage.Manufactured;
    }
    if (isPharmacy) {
      // Pharmacy can only record if current stage is Distributed (1)
      return verification.currentStage === SupplyChainStage.Distributed;
    }
    return true;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-medical-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-accent-50 text-accent-600 rounded-xl">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              Verifier Scanner (Distributor & Apotek)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pindai QR Code kemasan obat saat penerimaan barang untuk memverifikasi keaslian dan membubuhkan <strong>Checkpoint On-Chain</strong> secara permanen di blockchain Polygon Amoy.
          </p>
        </div>

        {/* Role Status Card */}
        <div className="bg-surface-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-center min-w-[240px]">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Status Login Aktor</div>
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

      {/* Main Grid: Scanner Left, Details & Checkpoint Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Scanner */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-brand-600" />
              Pemindai QR Code Kemasan
            </h2>
            <Html5Scanner onScanSuccess={handleBatchScanned} />

            {/* Manual ID Input Fallback */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Atau Ketik ID Batch Manual:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedBatchId}
                  onChange={(e) => setScannedBatchId(e.target.value)}
                  placeholder="BATCH-2026-PARA500"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleBatchScanned(scannedBatchId)}
                  disabled={loadingBatch || !scannedBatchId.trim()}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loadingBatch ? "Cek..." : "Muat"}
                </button>
              </div>
            </div>
          </div>

          {/* Sequence Rules Card */}
          <div className="bg-surface-50 border border-slate-200 rounded-3xl p-6 text-xs space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Aturan Rantai Pasok Ketat (Anti-Bypass)
            </h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong>Produsen (Manufacturer):</strong> Mendaftarkan obat dan mencatat fase <em>Manufactured</em>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong>Distributor (PBF):</strong> Mencatat penerimaan di gudang distribusi, transisi ke fase <em>Distributed</em>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong>Apotek (Pharmacy):</strong> Mencatat barang tiba di apotek, transisi ke <em>AtPharmacy</em>. Apotek <strong>tidak dapat</strong> mencatat jika belum dicatat oleh distributor resmi.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Batch Info, Status & Checkpoint Action */}
        <div className="lg:col-span-7 space-y-6">
          {/* Feedback Messages */}
          {txSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{txSuccessMsg}</span>
              </div>
              {txUrl && (
                <a
                  href={txUrl}
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
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Gagal Mencatat Checkpoint:</div>
                <div className="text-xs text-rose-800 mt-1 font-mono">{txError}</div>
              </div>
            </div>
          )}

          {fetchError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
              {fetchError}
            </div>
          )}

          {loadingBatch ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
              <span>Memverifikasi batch obat di blockchain Polygon Amoy...</span>
            </div>
          ) : !verification ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
              <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">Belum Ada Batch yang Dipindai</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Silakan scan QR code kemasan obat melalui pemindai di sebelah kiri atau ketik ID batch untuk memulai verifikasi checkpoint penerimaan barang.
              </p>
            </div>
          ) : !verification.isValid ? (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-900 space-y-2">
              <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
              <h3 className="font-bold text-lg">Batch Obat Tidak Ditemukan</h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">
                ID Batch <strong>{verification.batchId}</strong> tidak terdaftar pada smart contract resmi OBTENTIK. Jangan terima atau lanjutkan distribusi produk ini.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scanned Batch Summary Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-600">
                      Hasil Pemindaian On-Chain
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {detail?.productName || verification.batchId}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">
                      Batch ID: {verification.batchId}
                    </p>
                  </div>

                  <div>
                    <span className="inline-block bg-brand-50 border border-brand-200 text-brand-700 font-bold px-3 py-1 rounded-xl text-xs">
                      {verification.currentStageLabel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-surface-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400">No. BPOM</span>
                    <div className="font-bold text-slate-900 font-mono mt-0.5">
                      {detail?.bpomNumber}
                    </div>
                  </div>
                  <div className="bg-surface-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400">Nomor Lot</span>
                    <div className="font-bold text-slate-900 font-mono mt-0.5">
                      {detail?.lotNumber}
                    </div>
                  </div>
                  <div className="bg-surface-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400">Tanggal Expired</span>
                    <div className="font-bold text-emerald-700 mt-0.5">
                      {detail?.expiryDateFormatted}
                    </div>
                  </div>
                  <div className="bg-surface-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400">Total Checkpoint</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {verification.checkpointCount} Titik Rekam
                    </div>
                  </div>
                </div>

                {/* Recalled or Expired Warning */}
                {verification.isRecalled && (
                  <div className="bg-rose-100 border border-rose-300 p-3.5 rounded-2xl text-rose-950 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      BATCH INI TELAH DI-RECALL: Dilarang keras melanjutkan proses distribusi atau penerimaan barang!
                    </span>
                  </div>
                )}
              </div>

              {/* Action Form: Record Checkpoint */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    {role === "DISTRIBUTOR" ? (
                      <Truck className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Store className="w-5 h-5 text-emerald-600" />
                    )}
                    Catat Checkpoint Penerimaan Barang ({role})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mencatat tanda terima fisik secara kriptografis menggunakan dompet Web3 yang telah terdaftar di whitelist.
                  </p>
                </div>

                {/* Sequence Validation Banner */}
                {!isSequenceValidForRole() && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Urutan Rantai Pasok Belum Sesuai:
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      {isPharmacy && verification.currentStage === SupplyChainStage.Manufactured && (
                        <>
                          Apotek tidak dapat mencatat checkpoint karena batch obat masih berstatus <strong>Manufactured</strong>. Batch harus diterima dan dicatat terlebih dahulu oleh Distributor resmi (PBF).
                        </>
                      )}
                      {isDistributor && verification.currentStage >= SupplyChainStage.Distributed && (
                        <>
                          Batch ini sudah berada pada fase <strong>Distributed</strong> atau lebih tinggi. Distributor tidak dapat menduplikasi checkpoint pada batch yang sama.
                        </>
                      )}
                      {verification.currentStage === SupplyChainStage.AtPharmacy && (
                        <>
                          Batch ini telah mencapai fase akhir di Apotek (<strong>AtPharmacy</strong>).
                        </>
                      )}
                    </p>
                  </div>
                )}

                <form onSubmit={handleRecordCheckpoint} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      Lokasi Fasilitas Penerimaan (Gudang/Apotek) *
                    </label>
                    <input
                      type="text"
                      required
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="contoh: Gudang PBF Kimia Farma Trading & Distribution, Cikarang"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-600" />
                      Catatan Mutu & Kondisi Penerimaan (QC Notes)
                    </label>
                    <textarea
                      rows={2}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="contoh: Suhu cold chain 15-25°C stabil, segel utuh, jumlah botol sesuai surat jalan."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !isAuthorizedScanner || !isSequenceValidForRole()}
                      className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-bold py-3.5 rounded-2xl shadow-md shadow-brand-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Menandatangani Checkpoint On-Chain...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Kirim Checkpoint On-Chain (addCheckpoint)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Timeline for scanned batch */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  Linimasa Rantai Pasok Terkini
                </h3>
                <Timeline checkpoints={checkpoints} currentStage={verification.currentStage} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
