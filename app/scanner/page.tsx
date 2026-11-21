"use client";

import React, { useCallback, useState } from "react";
import { useObtentik } from "@/frontend-exports";
import Html5Scanner from "@/components/Html5Scanner";
import RoleBadge from "@/components/RoleBadge";
import Timeline from "@/components/Timeline";
import { extractBatchId } from "@/lib/qrParser";
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
  ShieldCheck,
  Building2,
  Lock,
} from "lucide-react";
import {
  BatchDetail,
  BatchVerificationResult,
  CheckpointData,
  SupplyChainStage,
} from "@/frontend-exports/blockchain/types";

function getRoleLabel(role: string | null) {
  switch (role) {
    case "ADMIN":
      return "regulator";
    case "MANUFACTURER":
      return "produsen";
    case "DISTRIBUTOR":
      return "distributor";
    case "PHARMACY":
      return "apotek";
    case "CONSUMER":
      return "konsumen";
    default:
      return "belum dikenali";
  }
}

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
  const handleBatchScanned = useCallback(
    async (rawId: string) => {
      const cleanId = extractBatchId(rawId);
      if (!cleanId) return;

      setScannedBatchId(cleanId);
      setLoadingBatch(true);
      setFetchError(null);
      setTxSuccessMsg(null);
      setTxError(null);

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
    },
    [verifyBatch, getBatchDetail, getBatchCheckpoints]
  );

  // Submit on-chain Checkpoint (addCheckpoint / verifyCheckpoint)
  const handleRecordCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractBatchId(scannedBatchId);
    if (!cleanId || !locationInput.trim()) return;

    setIsSubmitting(true);
    setTxSuccessMsg(null);
    setTxUrl(null);
    setTxError(null);

    try {
      const result = await addCheckpoint({
        batchId: cleanId,
        location: locationInput.trim(),
        notes: notesInput.trim(),
      });

      setTxSuccessMsg(
        `Titik pemeriksaan penerimaan barang berhasil dicatat di blockchain pada blok #${result.blockNumber}!`
      );
      setTxUrl(result.explorerUrl);

      // Refresh batch data & timeline
      await handleBatchScanned(cleanId);
    } catch (err: any) {
      setTxError(err.message || "Gagal mencatat titik pemeriksaan ke kontrak pintar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDistributor = role === "DISTRIBUTOR";
  const isPharmacy = role === "PHARMACY";
  const isAuthorizedScanner = isDistributor || isPharmacy;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-medical-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-navy-900 text-cyan-300 rounded-2xl shadow-sm">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Meja Verifikasi & Titik Pemeriksaan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Pindai kode QR kemasan obat saat serah terima untuk memverifikasi keutuhan rantai pasok dan mencatat <strong>titik pemeriksaan</strong> secara permanen di blockchain Polygon Amoy.
          </p>
        </div>

        {/* Role Status Card */}
        <div className="bg-surface-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-center min-w-[240px] shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Status Autentikasi Dompet
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

      {/* Main Grid: Scanner Left, Details & Checkpoint Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Scanner */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-600" />
              <span>Pemindai QR Code Kemasan Fisik</span>
            </h2>
            <Html5Scanner onScanSuccess={handleBatchScanned} />

            {/* Manual ID Input Fallback */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Atau Ketik ID Batch Manual:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedBatchId}
                  onChange={(e) => setScannedBatchId(e.target.value)}
                  placeholder="BATCH-2026-PARA500"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleBatchScanned(scannedBatchId)}
                  disabled={loadingBatch || !scannedBatchId.trim()}
                  className="px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {loadingBatch ? "Cek..." : "Muat"}
                </button>
              </div>
            </div>
          </div>

          {/* Sequence Rules Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-xs space-y-3.5 shadow-sm">
            <h3 className="font-bold text-navy-900 flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Aturan rantai pasok yang ketat</span>
            </h3>
            <div className="space-y-2.5 text-slate-600">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-teal-50/50 border border-teal-100">
                <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-navy-900">Produsen:</strong> Mendaftarkan obat dan mencatat tahap produksi.
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-cyan-50/50 border border-cyan-100">
                <div className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-navy-900">Distributor (PBF):</strong> Mencatat penerimaan di gudang distribusi.
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-navy-900">Apotek:</strong> Mencatat barang tiba di apotek. Apotek <strong>tidak dapat</strong> mencatat jika belum dicatat oleh distributor.
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
                <span className="font-semibold">{txSuccessMsg}</span>
              </div>
              {txUrl && (
                <a
                  href={txUrl}
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
                <div className="font-bold">Gagal mencatat titik pemeriksaan:</div>
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
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <span>Memverifikasi batch obat di jaringan Polygon Amoy...</span>
            </div>
          ) : !verification ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-extrabold text-navy-900 text-base">Belum Ada Batch yang Dipindai</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Silakan pindai kode QR kemasan obat melalui kamera di sebelah kiri atau ketik ID batch untuk memulai verifikasi titik pemeriksaan penerimaan barang.
              </p>
            </div>
          ) : !verification.isValid ? (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-900 space-y-2">
              <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
              <h3 className="font-bold text-lg">Batch obat tidak ditemukan di blockchain</h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">
                ID batch <strong>{verification.batchId}</strong> tidak terdaftar pada kontrak pintar resmi OBTENTIK. Dilarang menerima atau melanjutkan distribusi produk ini.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scanned Batch Summary Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                      Hasil pemindaian di blockchain
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                      {detail?.productName || verification.batchId}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 font-semibold">
                      Batch ID: {verification.batchId}
                    </p>
                  </div>

                  <div>
                    <span className="inline-block bg-teal-50 border border-teal-200 text-teal-800 font-bold px-3 py-1 rounded-xl text-xs">
                      {verification.currentStageLabel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-surface-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-semibold">No. BPOM</span>
                    <div className="font-bold text-navy-900 font-mono mt-0.5">
                      {detail?.bpomNumber}
                    </div>
                  </div>
                  <div className="bg-surface-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-semibold">Nomor Lot</span>
                    <div className="font-bold text-navy-900 font-mono mt-0.5">
                      {detail?.lotNumber}
                    </div>
                  </div>
                  <div className="bg-surface-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-semibold">Tanggal kedaluwarsa</span>
                    <div className="font-bold text-teal-700 mt-0.5">
                      {detail?.expiryDateFormatted}
                    </div>
                  </div>
                  <div className="bg-surface-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-semibold">Jumlah titik pemeriksaan</span>
                    <div className="font-bold text-navy-900 mt-0.5 font-mono">
                      {verification.checkpointCount} Titik
                    </div>
                  </div>
                </div>

                {/* Recalled Warning */}
                {verification.isRecalled && (
                  <div className="bg-rose-100 border border-rose-300 p-4 rounded-2xl text-rose-950 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      BATCH INI TELAH DITARIK: Dilarang keras melanjutkan proses serah terima atau distribusi!
                    </span>
                  </div>
                )}
              </div>

              {/* Action Form: Record Checkpoint */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-navy-900 flex items-center gap-2">
                    {role === "DISTRIBUTOR" ? (
                      <Truck className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Store className="w-5 h-5 text-emerald-600" />
                    )}
                    <span>Catat penerimaan barang ({role === "DISTRIBUTOR" ? "Distributor" : "Apotek"})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mencatat serah terima fisik secara kriptografis menggunakan dompet Web3 yang telah mendapat izin di blockchain.
                  </p>
                </div>

                {/* Sequence Validation Banner */}
                {!isSequenceValidForRole() && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Urutan Rantai Pasok Belum Sesuai:
                    </div>
                    <p className="text-amber-900 leading-relaxed">
                      {isPharmacy && verification.currentStage === SupplyChainStage.Manufactured && (
                        <>
                          Apotek tidak dapat mencatat titik pemeriksaan karena batch obat masih berada pada tahap produksi. Batch harus diterima dan dicatat terlebih dahulu oleh distributor resmi (PBF).
                        </>
                      )}
                      {isDistributor && verification.currentStage >= SupplyChainStage.Distributed && (
                        <>
                          Batch ini sudah berada pada tahap distribusi atau lebih lanjut. Distributor tidak dapat mencatat ulang titik pemeriksaan pada batch yang sama.
                        </>
                      )}
                      {verification.currentStage === SupplyChainStage.AtPharmacy && (
                        <>
                          Batch ini telah mencapai tahap akhir di apotek.
                        </>
                      )}
                      {!isAuthorizedScanner && (
                        <>
                          Dompet Anda terdeteksi sebagai <strong>{getRoleLabel(role)}</strong>. Hanya dompet milik distributor atau apotek yang berwenang mencatat titik pemeriksaan.
                        </>
                      )}
                    </p>
                  </div>
                )}

                <form onSubmit={handleRecordCheckpoint} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>Lokasi Fasilitas Penerimaan (Gudang/Apotek) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="contoh: Gudang PBF Kimia Farma Trading & Distribution, Cikarang"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>Catatan mutu dan kondisi penerimaan</span>
                    </label>
                    <textarea
                      rows={2}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="contoh: Suhu cold chain 15-25°C stabil, segel utuh, jumlah kemasan sesuai surat jalan."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !isAuthorizedScanner || !isSequenceValidForRole()}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-navy-900 via-navy-800 to-teal-700 hover:from-navy-850 hover:to-teal-600 active:scale-95 text-white text-xs font-bold py-3.5 rounded-2xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                          <span>Menandatangani pencatatan titik pemeriksaan...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                          <span>Catat titik pemeriksaan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Timeline for scanned batch */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
                <h3 className="font-extrabold text-base text-navy-900 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Linimasa Rantai Pasok Terkini</span>
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
