"use client";

import React from "react";
import { BatchVerificationResult, BatchDetail } from "@/frontend-exports/blockchain/types";
import {
  ShieldCheck,
  AlertOctagon,
  CalendarX,
  FileQuestion,
  ExternalLink,
  Award,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  BadgeAlert,
} from "lucide-react";
import { getExplorerAddressUrl } from "@/frontend-exports/blockchain/chains";

interface StatusBannerProps {
  verification: BatchVerificationResult | null;
  detail: BatchDetail | null;
}

export default function StatusBanner({ verification, detail }: StatusBannerProps) {
  if (!verification) return null;

  // 1. Batch Not Found / Invalid (Failed Verification)
  if (!verification.isValid) {
    return (
      <div className="bg-white border-l-4 border-rose-500 p-6 sm:p-8 text-rose-950 animate-in fade-in">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 shrink-0">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              <BadgeAlert className="w-3.5 h-3.5" />
              <span>Tidak Terdaftar / Waspada Obat Palsu</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-rose-950">
              Batch obat tidak ditemukan di blockchain
            </h3>
            <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
              ID batch <code className="bg-rose-50 border border-rose-200 font-mono px-2 py-0.5 rounded text-rose-900 font-bold">{verification.batchId}</code> tidak tercatat dalam registri resmi kontrak pintar OBTENTIK di jaringan uji Polygon Amoy.
            </p>
            <div className="pt-2 text-xs text-rose-800 bg-rose-50/80 p-4 rounded-2xl border border-rose-200/80 leading-relaxed">
              ⚠️ <strong>Protokol Keselamatan Pasien:</strong> Hindari mengonsumsi produk tanpa identitas ketertelusuran farmasi terverifikasi. Segera laporkan kemasan ini ke fasilitas apotek penyedia atau Halo BPOM 1500533.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Batch Recalled (Emergency Safety Recall Action)
  if (verification.isRecalled) {
    return (
      <div className="bg-white border-l-4 border-red-600 p-6 sm:p-8 text-red-950 animate-in fade-in">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="p-3.5 bg-red-100 border border-red-200 rounded-2xl text-red-600 shrink-0">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-900 border border-red-200">
              <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
              <span>Perintah penarikan obat resmi</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-red-950">
              Obat Telah Ditarik dari Peredaran
            </h3>
            <p className="text-xs sm:text-sm text-red-900 leading-relaxed">
              Batch ini terdaftar resmi, tetapi telah diterbitkan instruksi <strong>penarikan di blockchain</strong> oleh regulator BPOM atau pabrik farmasi penanggung jawab. Seluruh peredaran dan konsumsi produk ini telah dihentikan.
            </p>
            {detail?.recallReason && (
              <div className="bg-red-50 border border-red-200/90 p-4 rounded-2xl text-xs sm:text-sm">
                <span className="font-bold text-red-900">Alasan resmi penarikan:</span>
                <p className="text-red-800 mt-1 font-medium">{detail.recallReason}</p>
              </div>
            )}
            <div className="text-xs text-red-800 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
              ⛔ <strong>Tindakan Wajib Pasien:</strong> Segera hentikan konsumsi obat dan kembalikan produk ke apotek atau rumah sakit tempat Anda membeli.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Batch Expired (Past Safety Expiry Date)
  if (verification.isExpired) {
    return (
      <div className="bg-white border-l-4 border-amber-500 p-6 sm:p-8 text-amber-950 animate-in fade-in">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="p-3.5 bg-amber-100 border border-amber-200 rounded-2xl text-amber-600 shrink-0">
            <CalendarX className="w-8 h-8" />
          </div>
          <div className="space-y-2.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
              <CalendarX className="w-3.5 h-3.5" />
              <span>Masa Berlaku Kedaluwarsa Telah Lewat</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-amber-950">
              Obat sudah tidak layak dikonsumsi
            </h3>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              Batch obat ini asli dan tercatat pada rantai pasok resmi, namun tanggal kedaluwarsa telah terlampaui pada <strong>{detail?.expiryDateFormatted || "-"}</strong>.
            </p>
            <div className="text-xs text-amber-800 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 leading-relaxed">
              ⚠️ Obat yang telah melewati masa kedaluwarsa berpotensi kehilangan efektivitas bahan aktif atau membentuk senyawa kimia berbahaya. Jangan dikonsumsi.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authentic & Verified On-Chain (Golden Medical State)
  return (
    <div className="bg-[#f7f8f4] border-t-2 border-[#35786f] p-6 sm:p-8 text-slate-900">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-[#2e7772] rounded-full text-white shrink-0">
            <ShieldCheck className="w-8 h-8 stroke-[2.3]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 mb-1.5">
              <Award className="w-3.5 h-3.5 text-teal-600" />
              <span>100% asli & terverifikasi di blockchain</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              {detail?.productName || "Produk Farmasi Resmi"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ID batch: <span className="font-mono font-bold text-teal-700">{verification.batchId}</span> • Kontrak pintar Polygon Amoy
            </p>
          </div>
        </div>

        {/* Stage & Checkpoint Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-surface-50 border border-slate-200/80 px-4 py-2 rounded-2xl text-left">
            <div className="text-[10px] uppercase font-bold text-slate-400">Fase Rantai Pasok</div>
            <div className="text-xs font-bold text-navy-900 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>{verification.currentStageLabel}</span>
            </div>
          </div>
          <div className="bg-surface-50 border border-slate-200/80 px-4 py-2 rounded-2xl text-left">
            <div className="text-[10px] uppercase font-bold text-slate-400">Jumlah titik pemeriksaan</div>
            <div className="text-xs font-bold text-navy-900 mt-0.5 font-mono">
              {verification.checkpointCount} Titik Sah
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Grid */}
      {detail && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 text-xs">
          <div className="bg-surface-50 p-3.5 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 font-semibold">Nomor Registrasi BPOM (NIE)</span>
            <div className="font-bold text-navy-900 mt-1 text-sm font-mono">{detail.bpomNumber}</div>
          </div>
          <div className="bg-surface-50 p-3.5 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 font-semibold">Nomor Lot Pabrik</span>
            <div className="font-bold text-navy-900 mt-1 text-sm font-mono">{detail.lotNumber}</div>
          </div>
          <div className="bg-surface-50 p-3.5 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 font-semibold">Tanggal Produksi</span>
            <div className="font-bold text-slate-800 mt-1 text-sm">{detail.productionDateFormatted}</div>
          </div>
          <div className="bg-surface-50 p-3.5 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 font-semibold">Tanggal kedaluwarsa</span>
            <div className="font-bold text-teal-700 mt-1 text-sm">{detail.expiryDateFormatted}</div>
          </div>
        </div>
      )}
    </div>
  );
}
