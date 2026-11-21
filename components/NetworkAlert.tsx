"use client";

import React from "react";
import { useObtentik } from "@/frontend-exports";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function NetworkAlert() {
  const { isConnected, isCorrectNetwork, chainId, switchToAmoy } = useObtentik();

  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-900 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            MetaMask Anda terhubung ke Chain ID <strong>{chainId || "Unknown"}</strong>. Smart contract OBTENTIK beroperasi di <strong>Polygon Amoy Testnet (Chain ID 80002)</strong>.
          </span>
        </div>
        <button
          onClick={() => switchToAmoy()}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Beralih ke Polygon Amoy
        </button>
      </div>
    </div>
  );
}
