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
} from "lucide-react";
import { getExplorerAddressUrl } from "@/frontend-exports/blockchain/chains";

interface StatusBannerProps {
  verification: BatchVerificationResult | null;
  detail: BatchDetail | null;
}

export default function StatusBanner({ verification, detail }: StatusBannerProps) {
  if (!verification) return null;

  // 1. Batch Not Found / Invalid
  if (!verification.isValid) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 shadow-sm animate-in fade-in">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-100 rounded-xl text-rose-600 shrink-0">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-200/70 text-rose-800">
              Tidak Terverifikasi / Waspada Palsu
            </div>
            <h3 className="text-xl font-bold text-rose-950">
              Batch Obat Tidak Ditemukan
            </h3>
            <p className="text-sm text-rose-750 text-rose-800 leading-relaxed">
              Batch ID <code className="bg-rose-100 font-mono px-1.5 py-0.5 rounded text-rose-900 font-semibold">{verification.batchId}</code> tidak tercatat dalam registri resmi OBTENTIK.
            </p>
            <div className="pt-2 text-xs text-rose-700 bg-rose-100/60 p-3 rounded-lg border border-rose-200/60">
              ⚠️ <strong>Peringatan Keamanan Pasien:</strong> Jangan mengonsumsi obat yang tidak memiliki identitas rantai pasok terverifikasi. Segera laporkan kemasan ini ke Halo BPOM 1500533 atau apotek tempat Anda membeli.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Batch Recalled
  if (verification.isRecalled) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-2xl p-6 text-red-950 shadow-sm animate-in fade-in">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-red-200 text-red-900">
              PERINTAH PENARIKAN (RECALLED)
            </div>
            <h3 className="text-xl font-bold text-red-950">
              Obat Telah Ditarik dari Peredaran
            </h3>
            <p className="text-sm text-red-900">
              Produk ini terdaftar resmi namun telah diterbitkan instruksi <strong>RECALL on-chain</strong> oleh pihak berwenang atau pabrik farmasi.
            </p>
            {detail?.recallReason && (
              <div className="bg-white/80 border border-red-200 p-3 rounded-xl text-sm">
                <span className="font-semibold text-red-900">Alasan Penarikan Resmi:</span>
                <p className="text-red-800 mt-0.5">{detail.recallReason}</p>
              </div>
            )}
            <div className="text-xs text-red-800 font-medium">
              ⛔ <strong>Tindakan Wajib:</strong> Hentikan konsumsi dan kembalikan produk ke fasilitas kesehatan atau apotek penyedia.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Batch Expired
  if (verification.isExpired) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-amber-950 shadow-sm animate-in fade-in">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shrink-0">
            <CalendarX className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-200 text-amber-900">
              KEDALUWARSA (EXPIRED)
            </div>
            <h3 className="text-xl font-bold text-amber-950">
              Masa Kedaluwarsa Obat Telah Lewat
            </h3>
            <p className="text-sm text-amber-900 leading-relaxed">
              Batch obat ini asli dan tercatat di rantai pasok resmi, namun tanggal kedaluwarsa telah terlewati pada <strong>{detail?.expiryDateFormatted || "-"}</strong>.
            </p>
            <div className="text-xs text-amber-800 bg-amber-100/70 p-3 rounded-lg border border-amber-200">
              ⚠️ Obat yang telah melewati masa kedaluwarsa berisiko mengalami penurunan efektivitas zat aktif atau pembentukan senyawa samping yang berbahaya.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authentic & Safe for Consumption
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-2xl p-6 text-emerald-950 shadow-sm animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              100% Asli & Terverifikasi On-Chain
            </div>
            <h3 className="text-2xl font-bold text-emerald-950">
              {detail?.productName || "Produk Farmasi Asli"}
            </h3>
            <p className="text-xs text-emerald-700">
              Batch ID: <span className="font-mono font-semibold">{verification.batchId}</span> • Terverifikasi di Polygon Amoy Testnet
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white/90 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-600">Status Rantai Pasok</div>
            <div className="text-xs font-bold text-slate-800">{verification.currentStageLabel}</div>
          </div>
          <div className="bg-white/90 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-600">Total Checkpoint</div>
            <div className="text-xs font-bold text-slate-800">{verification.checkpointCount} Titik Rekam</div>
          </div>
        </div>
      </div>

      {detail && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="bg-white/80 border border-emerald-100/80 p-2.5 rounded-xl">
            <div className="text-slate-500 font-medium">Nomor Registrasi BPOM</div>
            <div className="font-bold text-slate-900 mt-0.5 text-sm">{detail.bpomNumber}</div>
          </div>
          <div className="bg-white/80 border border-emerald-100/80 p-2.5 rounded-xl">
            <div className="text-slate-500 font-medium">Nomor Lot Produksi</div>
            <div className="font-bold text-slate-900 mt-0.5 text-sm font-mono">{detail.lotNumber}</div>
          </div>
          <div className="bg-white/80 border border-emerald-100/80 p-2.5 rounded-xl">
            <div className="text-slate-500 font-medium">Tanggal Produksi</div>
            <div className="font-bold text-slate-900 mt-0.5 text-sm">{detail.productionDateFormatted}</div>
          </div>
          <div className="bg-white/80 border border-emerald-100/80 p-2.5 rounded-xl">
            <div className="text-slate-500 font-medium">Kedaluwarsa (Exp Date)</div>
            <div className="font-bold text-emerald-700 mt-0.5 text-sm">{detail.expiryDateFormatted}</div>
          </div>
        </div>
      )}
    </div>
  );
}
