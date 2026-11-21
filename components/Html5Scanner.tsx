"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, Image as ImageIcon, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

interface Html5ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  paused?: boolean;
}

export default function Html5Scanner({
  onScanSuccess,
  onScanError,
  paused = false,
}: Html5ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<"camera" | "file">("camera");
  const scannerInstanceRef = useRef<any>(null);
  const readerElementId = "obtentik-html5-qrcode-reader";

  useEffect(() => {
    let isMounted = true;

    // Dynamically import html5-qrcode to prevent SSR errors
    async function startScanner() {
      if (scanMode !== "camera" || paused) return;

      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        // Cleanup any prior instance
        if (scannerInstanceRef.current) {
          try {
            await scannerInstanceRef.current.stop();
          } catch (e) {
            // ignore
          }
        }

        const html5QrCode = new Html5Qrcode(readerElementId);
        scannerInstanceRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            if (isMounted) {
              onScanSuccess(decodedText);
            }
          },
          (err: any) => {
            if (onScanError) {
              onScanError(err);
            }
          }
        );

        if (isMounted) {
          setIsScanning(true);
          setScannerError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setIsScanning(false);
          setScannerError(
            err.message || "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser."
          );
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            scannerInstanceRef.current?.clear();
          });
      }
    };
  }, [scanMode, paused, onScanSuccess, onScanError]);

  // Handle Image File Upload Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode(readerElementId);
      const result = await html5QrCode.scanFile(file, true);
      onScanSuccess(result);
      setScannerError(null);
    } catch (err: any) {
      setScannerError("Gagal membaca QR Code dari berkas gambar. Pastikan gambar QR Code jelas dan tajam.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setScanMode("camera")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              scanMode === "camera"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Kamera Langsung
          </button>
          <button
            onClick={() => setScanMode("file")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              scanMode === "file"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Unggah Berkas Gambar
          </button>
        </div>

        {scanMode === "camera" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className={`w-2 h-2 rounded-full ${isScanning ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            {isScanning ? "Kamera Aktif" : "Menyiapkan Kamera..."}
          </span>
        )}
      </div>

      {/* Reader Container */}
      <div className="relative overflow-hidden bg-slate-950 rounded-2xl min-h-[300px] flex items-center justify-center">
        <div id={readerElementId} className="w-full max-w-[360px] mx-auto text-white overflow-hidden" />

        {scanMode === "camera" && isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Viewfinder Overlay Frame */}
            <div className="w-56 h-56 border-2 border-brand-400 rounded-2xl relative shadow-2xl">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-brand-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-brand-500" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-brand-500" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-brand-500" />
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>
        )}

        {/* File Upload Mode View */}
        {scanMode === "file" && (
          <div className="text-center p-8 bg-slate-900 w-full h-full flex flex-col items-center justify-center">
            <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl bg-slate-800/60 transition group max-w-xs w-full">
              <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-brand-400 mb-2 transition" />
              <span className="text-xs font-semibold text-slate-200">
                Pilih Foto QR Code Kemasan
              </span>
              <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, JPEG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Error Message */}
      {scannerError && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{scannerError}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Arahkan kamera ke QR Code yang tercetak di kemasan obat atau unggah foto untuk mendeteksi ID batch secara otomatis.
        </p>
      </div>
    </div>
  );
}
