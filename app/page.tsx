"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  verifyBatch,
  getBatchDetail,
  getBatchCheckpoints,
  getAllBatches,
  BatchVerificationResult,
  BatchDetail,
  CheckpointData,
} from "@/frontend-exports";
import StatusBanner from "@/components/StatusBanner";
import Timeline from "@/components/Timeline";
import Html5Scanner from "@/components/Html5Scanner";
import {
  Search,
  QrCode,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Pill,
  CheckCircle,
} from "lucide-react";
import { getExplorerAddressUrl } from "@/frontend-exports/blockchain/chains";

function ConsumerPageContent() {
  const searchParams = useSearchParams();
  const [batchIdInput, setBatchIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<BatchVerificationResult | null>(null);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Load existing batches from blockchain for sample discovery
  useEffect(() => {
    async function loadBatches() {
      try {
        setLoadingBatches(true);
        const batches = await getAllBatches();
        setAvailableBatches(batches);
      } catch (e) {
        console.warn("Could not fetch batch list from chain:", e);
      } finally {
        setLoadingBatches(false);
      }
    }
    loadBatches();
  }, []);

  // Check URL query parameter on mount (e.g. from QR Code scan URL)
  useEffect(() => {
    const queryBatch = searchParams.get("batchId");
    if (queryBatch) {
      setBatchIdInput(queryBatch);
      executeVerification(queryBatch);
    }
  }, [searchParams]);

  // Main verification function (100% read-only, gasless, zero-wallet)
  const executeVerification = async (targetId: string) => {
    const cleanId = targetId.trim();
    if (!cleanId) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Verify batch validity on Polygon Amoy
      const verResult = await verifyBatch(cleanId);
      setVerification(verResult);

      if (verResult.isValid) {
        // 2. Fetch full detail and timeline
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
      console.error("Verification error:", err);
      setErrorMsg(err.message || "Gagal memverifikasi obat ke blockchain Polygon Amoy.");
      setVerification(null);
      setDetail(null);
      setCheckpoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(batchIdInput);
  };

  const handleScanSuccess = (scannedText: string) => {
    // If QR contains full URL or just batch ID
    let extractedId = scannedText;
    try {
      if (scannedText.includes("batchId=")) {
        const url = new URL(scannedText);
        extractedId = url.searchParams.get("batchId") || scannedText;
      }
    } catch (e) {
      // ignore
    }

    setBatchIdInput(extractedId);
    setShowScanner(false);
    executeVerification(extractedId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
          <Sparkles className="w-3.5 h-3.5 text-accent-500" />
          <span>Verifikasi Publik • Bebas Biaya • Tanpa Wallet</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Cek Keaslian & Rantai Pasok Obat Farmasi
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Lindungi diri dan keluarga dari obat palsu atau kedaluwarsa. Masukkan ID Batch dari kemasan atau pindai QR Code untuk memverifikasi catatan resmi di blockchain <strong>Polygon Amoy</strong>.
        </p>
      </div>

      {/* Search & Scan Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-medical-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={batchIdInput}
                onChange={(e) => setBatchIdInput(e.target.value)}
                placeholder="Masukkan ID Batch (contoh: BATCH-2026-PARA500)"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:bg-white transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowScanner(!showScanner)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-slate-200 bg-surface-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition"
                title="Pindai QR Code Kemasan"
              >
                <QrCode className="w-5 h-5 text-brand-600" />
                <span className="hidden sm:inline">Pindai QR</span>
              </button>
              <button
                type="submit"
                disabled={loading || !batchIdInput.trim()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifikasi Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Live Batches Discovery from Blockchain */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Batch Terdaftar di Amoy:</span>
          {availableBatches.length > 0 ? (
            availableBatches.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setBatchIdInput(b);
                  executeVerification(b);
                }}
                className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-mono font-semibold transition border border-brand-200/60"
              >
                {b}
              </button>
            ))
          ) : (
            <span className="text-slate-400 italic">
              {loadingBatches
                ? "Memuat daftar batch dari blockchain..."
                : "Belum ada batch terdaftar di kontrak. Produsen dapat mendaftarkan batch di Dashboard Admin."}
            </span>
          )}
        </div>

        {/* Camera Scanner View */}
        {showScanner && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-brand-600" />
                Pindai QR Code dari Kemasan Fisik
              </h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Tutup Scanner
              </button>
            </div>
            <Html5Scanner onScanSuccess={handleScanSuccess} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Terjadi Kesalahan Verifikasi</div>
            <div className="text-xs text-rose-700 mt-0.5">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Verification Result Display */}
      {verification && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Status Banner */}
          <StatusBanner verification={verification} detail={detail} />

          {/* Full Details & Supply Chain Timeline */}
          {verification.isValid && detail && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Specifications Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-brand-600" />
                    Spesifikasi Produk Obat
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 font-medium">Nama Produk Farmasi</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {detail.productName}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Nomor Izin Edar (NIE) BPOM</div>
                      <div className="font-mono font-semibold text-slate-800 bg-slate-50 p-2 rounded-xl border border-slate-200 mt-0.5">
                        {detail.bpomNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Nomor Lot Produksi</div>
                      <div className="font-mono font-semibold text-slate-800 mt-0.5">
                        {detail.lotNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Tanggal Produksi (Mfg Date)</div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {detail.productionDateFormatted}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Kedaluwarsa (Exp Date)</div>
                      <div className="font-bold text-emerald-700 mt-0.5">
                        {detail.expiryDateFormatted}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Produsen Terverifikasi (Manufacturer)</div>
                      <div className="font-mono text-slate-700 break-all text-[11px] mt-0.5">
                        <a
                          href={getExplorerAddressUrl(detail.manufacturer)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <span>{detail.manufacturer}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Safety Guidance Card */}
                <div className="bg-brand-50/60 border border-brand-200/60 rounded-3xl p-6 text-xs text-brand-900 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-brand-800">
                    <FileCheck2 className="w-4 h-4 text-brand-600" />
                    Panduan Cek KLIK BPOM
                  </div>
                  <p className="text-brand-800/80 leading-relaxed">
                    Pastikan selalu melakukan <strong>Cek KLIK</strong>:
                    <br />
                    1. <strong>Kemasan</strong>: Pastikan dalam kondisi utuh dan segel tidak rusak.
                    <br />
                    2. <strong>Label</strong>: Baca informasi pada label dengan teliti.
                    <br />
                    3. <strong>Izin Edar</strong>: Verifikasi nomor izin edar BPOM di blockchain ini.
                    <br />
                    4. <strong>Kedaluwarsa</strong>: Jangan konsumsi obat yang telah lewat tanggal kedaluwarsa.
                  </p>
                </div>
              </div>

              {/* Supply Chain Timeline (Chain of Custody) */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100 mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        Linimasa Rantai Pasok (Chain of Custody)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rekam jejak perpindahan obat yang dicatat secara permanen dan tidak dapat diubah di blockchain Polygon Amoy.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-semibold border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{checkpoints.length} Checkpoint Sah</span>
                    </div>
                  </div>

                  <Timeline checkpoints={checkpoints} currentStage={verification.currentStage} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConsumerPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
          Memuat antarmuka verifikasi OBTENTIK...
        </div>
      }
    >
      <ConsumerPageContent />
    </Suspense>
  );
}
