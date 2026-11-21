"use client";

import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Printer, ShieldCheck, Pill } from "lucide-react";

interface QrModalProps {
  batch: {
    batchId: string;
    productName?: string;
    bpomNumber?: string;
    lotNumber?: string;
    expiryDateFormatted?: string;
    manufacturer?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function QrModal({ batch, isOpen, onClose }: QrModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!isOpen) return null;

  const cleanBatchId = (batch.batchId || "").trim();
  const verificationUrl = `${origin}/?batchId=${encodeURIComponent(cleanBatchId)}`;

  // Download QR Code as PNG
  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `QR-OBTENTIK-${cleanBatchId}.png`;
    link.href = url;
    link.click();
  };

  // Print Label
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-50 border border-brand-200 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Kode QR Kemasan Obat</h3>
          <p className="text-xs text-slate-500 mt-1">
            Dicetak pada blister, botol, atau kotak kemasan sekunder untuk verifikasi konsumen dan rantai pasok.
          </p>
        </div>

        {/* Printable Drug Label Box */}
        <div
          ref={qrRef}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center print:border-solid print:bg-white"
        >
          {/* QR Code Canvas */}
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-3">
            <QRCodeCanvas
              value={verificationUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200/60 mb-2">
            {cleanBatchId}
          </div>

          <div className="space-y-0.5 text-xs text-slate-600 w-full text-left bg-white p-3 rounded-xl border border-slate-200">
            {batch.productName && (
              <div className="flex justify-between">
                <span className="text-slate-400">Produk:</span>
                <span className="font-bold text-slate-900">{batch.productName}</span>
              </div>
            )}
            {batch.bpomNumber && (
              <div className="flex justify-between">
                <span className="text-slate-400">No. BPOM:</span>
                <span className="font-semibold text-slate-800">{batch.bpomNumber}</span>
              </div>
            )}
            {batch.lotNumber && (
              <div className="flex justify-between">
                <span className="text-slate-400">Lot:</span>
                <span className="font-mono text-slate-800">{batch.lotNumber}</span>
              </div>
            )}
            {batch.expiryDateFormatted && (
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal kedaluwarsa:</span>
                <span className="font-bold text-emerald-700">{batch.expiryDateFormatted}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tercatat permanen di Polygon Amoy (80002)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Unduh PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 px-4 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            Cetak Label
          </button>
        </div>
      </div>
    </div>
  );
}
