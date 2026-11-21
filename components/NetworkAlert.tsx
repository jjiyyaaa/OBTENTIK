"use client";

import React from "react";
import { useObtentik } from "@/frontend-exports";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function NetworkAlert() {
  const { isConnected, isCorrectNetwork, chainId, error, switchToAmoy } = useObtentik();

  if (error) {
    return (
      <div role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-900 sm:text-sm">
        <div className="mx-auto max-w-7xl flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-300/80 px-4 py-2.5 text-amber-950 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
          </div>
          <span>
            Dompet terhubung ke ID jaringan <strong className="font-mono">{chainId || "Tidak diketahui"}</strong>. Kontrak pintar OBTENTIK beroperasi di <strong>jaringan uji Polygon Amoy (ID jaringan 80002)</strong>.
          </span>
        </div>
        <button
          onClick={() => switchToAmoy()}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-sm transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Beralih ke Polygon Amoy</span>
        </button>
      </div>
    </div>
  );
}
