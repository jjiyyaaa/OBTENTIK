"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const scannerTransitionRef = useRef<Promise<void>>(Promise.resolve());
  const readerElementId = "obtentik-html5-qrcode-reader";

  // Stable callback refs prevent camera restarts when parent re-renders
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const onScanErrorRef = useRef(onScanError);
  onScanErrorRef.current = onScanError;

  // Safe scanner stop and clear helper
  const stopAndClearScanner = useCallback(async () => {
    const scanner = scannerInstanceRef.current;
    if (!scanner) return;
    scannerInstanceRef.current = null;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (err) {
      console.warn("Html5Scanner safe stop caught:", err);
    } finally {
      try {
        scanner.clear();
      } catch (clearErr) {
        // ignore
      }
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initCamera() {
      if (scanMode !== "camera" || paused) {
        await stopAndClearScanner();
        return;
      }

      try {
        // Stop any running instance before starting fresh
        await stopAndClearScanner();

        if (isCancelled) return;

        const { Html5Qrcode } = await import("html5-qrcode");

        // Verify container element exists in DOM
        const container = document.getElementById(readerElementId);
        if (!container || isCancelled) return;

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
            if (!isCancelled) {
              onScanSuccessRef.current(decodedText);
            }
          },
          (err: any) => {
            if (!isCancelled && onScanErrorRef.current) {
              onScanErrorRef.current(err);
            }
          }
        );

        if (!isCancelled) {
          setIsScanning(true);
          setScannerError(null);
        } else {
          // If cancelled during start, stop immediately
          if (html5QrCode.isScanning) {
            await html5QrCode.stop().catch(() => {});
          }
          try {
            html5QrCode.clear();
          } catch {}
          scannerInstanceRef.current = null;
        }
      } catch (err: any) {
        if (!isCancelled) {
          setIsScanning(false);
          const secureContextHint =
            !window.isSecureContext
              ? " Akses kamera memerlukan HTTPS atau localhost; gunakan unggah gambar jika halaman dibuka melalui HTTP di jaringan lokal."
              : "";
          setScannerError(
            `${err.message || "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser."}${secureContextHint}`
          );
        }
      }
    }

    const transition = scannerTransitionRef.current.then(initCamera);
    scannerTransitionRef.current = transition;
    void transition;

    return () => {
      isCancelled = true;
      scannerTransitionRef.current = scannerTransitionRef.current.then(
        stopAndClearScanner
      );
    };
  }, [scanMode, paused, stopAndClearScanner]);

  // Handle Image File Upload Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const scanTask = scannerTransitionRef.current.then(async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        await stopAndClearScanner();

        const html5QrCode = new Html5Qrcode(readerElementId);
        scannerInstanceRef.current = html5QrCode;

        const result = await html5QrCode.scanFile(file, true);
        onScanSuccessRef.current(result);
        setScannerError(null);
      } catch {
        setScannerError("Gagal membaca QR Code dari berkas gambar. Pastikan gambar QR Code jelas dan tajam.");
      } finally {
        await stopAndClearScanner();
        e.target.value = "";
      }
    });
    scannerTransitionRef.current = scanTask;
    await scanTask;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-1 p-1 bg-surface-100 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setScanMode("camera")}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              scanMode === "camera"
                ? "bg-navy-900 text-cyan-300 shadow-sm"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kamera Pemindai</span>
          </button>
          <button
            onClick={() => setScanMode("file")}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              scanMode === "file"
                ? "bg-navy-900 text-cyan-300 shadow-sm"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unggah Gambar</span>
          </button>
        </div>

        {scanMode === "camera" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                isScanning ? "bg-teal-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            <span>{isScanning ? "Sensor Kamera Siap" : "Menyiapkan Sensor..."}</span>
          </span>
        )}
      </div>

      {/* Reader Container */}
      <div className="relative overflow-hidden bg-navy-950 rounded-xl min-h-[300px] flex items-center justify-center border border-navy-800 shadow-inner">
        <div
          id={readerElementId}
          className="w-full max-w-[360px] mx-auto text-white overflow-hidden"
        />

        {scanMode === "camera" && isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Futuristic Medical Scanner Reticle */}
            <div className="w-56 h-56 border border-teal-500/40 rounded-2xl relative shadow-2xl">
              {/* Corner Crosshairs */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm" />

              {/* Scanning Laser Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-scan-laser shadow-glow-cyan" />
            </div>
          </div>
        )}

        {/* File Upload Mode View */}
        {scanMode === "file" && (
          <div className="text-center p-8 bg-navy-950 w-full h-full flex flex-col items-center justify-center">
            <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-navy-700 hover:border-teal-500 rounded-2xl bg-navy-900/70 transition group max-w-xs w-full">
              <div className="w-12 h-12 rounded-xl bg-navy-800 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <ImageIcon className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-slate-100">
                Pilih gambar kode QR pada kemasan
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Format PNG, JPG, JPEG, atau WEBP
              </span>
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
      <div className="mt-3.5 text-center">
        <p className="text-xs text-slate-500">
          Arahkan kamera ke kode QR pada label kemasan obat atau unggah gambar untuk verifikasi otomatis.
        </p>
      </div>
    </div>
  );
}
