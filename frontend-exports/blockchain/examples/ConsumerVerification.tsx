"use client";

/**
 * OBTENTIK - Consumer Verification Example Component (Next.js)
 * Implements Feature (1): Read-only batch verification without wallet / login.
 * Consumers simply scan or type a Batch ID to query Polygon Amoy Testnet directly.
 */

import React, { useState } from "react";
import {
  verifyBatch,
  getBatchDetail,
  getBatchCheckpoints,
  BatchVerificationResult,
  BatchDetail,
  CheckpointData,
} from "../index";

export default function ConsumerVerification() {
  const [batchIdInput, setBatchIdInput] = useState("BATCH-2026-PARA500");
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<BatchVerificationResult | null>(null);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchIdInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Instant check on Polygon Amoy without wallet
      const verResult = await verifyBatch(batchIdInput);
      setVerification(verResult);

      if (verResult.isValid) {
        // 2. Fetch full details and timeline
        const [batchDetail, timeline] = await Promise.all([
          getBatchDetail(batchIdInput),
          getBatchCheckpoints(batchIdInput),
        ]);
        setDetail(batchDetail);
        setCheckpoints(timeline);
      } else {
        setDetail(null);
        setCheckpoints([]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memverifikasi obat ke blockchain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px", fontFamily: "sans-serif" }}>
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
        <h2 style={{ color: "#0f172a", marginBottom: "8px" }}>
          🔍 Verifikasi Keaslian Obat OBTENTIK
        </h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: 0 }}>
          Pemeriksaan langsung ke Polygon Amoy Testnet (Chain ID 80002). 
          <strong> Tanpa perlu login, tanpa wallet, dan 100% gratis.</strong>
        </p>

        <form onSubmit={handleVerify} style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <input
            type="text"
            value={batchIdInput}
            onChange={(e) => setBatchIdInput(e.target.value)}
            placeholder="Masukkan ID Batch (contoh: BATCH-2026-PARA500)"
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </button>
        </form>

        {errorMsg && (
          <div style={{ marginTop: "16px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px" }}>
            ❌ {errorMsg}
          </div>
        )}

        {verification && (
          <div style={{ marginTop: "24px" }}>
            {/* Status Banner */}
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                background: verification.isSafeForConsumption ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${verification.isSafeForConsumption ? "#86efac" : "#fca5a5"}`,
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 6px 0", color: verification.isSafeForConsumption ? "#166534" : "#991b1b" }}>
                {verification.isSafeForConsumption
                  ? "✅ PRODUK RESMI & ASLI (OTENTIK)"
                  : verification.isRecalled
                  ? "⚠️ PERINGATAN: OBAT DITARIK DARI PEREDARAN (RECALLED)"
                  : verification.isExpired
                  ? "⚠️ PRODUK TELAH KEDALUWARSA"
                  : "❌ BATCH TIDAK TERDAFTAR"}
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: verification.isSafeForConsumption ? "#15803d" : "#b91c1c" }}>
                {verification.statusMessage}
              </p>
              <div style={{ marginTop: "8px", fontSize: "13px", color: "#475569" }}>
                Posisi Rantai Pasok Saat Ini: <strong>{verification.currentStageLabel}</strong> | Total Checkpoint: <strong>{verification.checkpointCount}</strong>
              </div>
            </div>

            {/* Batch Metadata Detail */}
            {detail && (
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#1e293b" }}>Informasi Produk Farmasi</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
                  <div><strong>Nama Obat:</strong> {detail.productName}</div>
                  <div><strong>Nomor Izin BPOM:</strong> {detail.bpomNumber}</div>
                  <div><strong>Nomor Lot:</strong> {detail.lotNumber}</div>
                  <div><strong>Tanggal Produksi:</strong> {detail.productionDateFormatted}</div>
                  <div><strong>Tanggal Kedaluwarsa:</strong> {detail.expiryDateFormatted}</div>
                  <div><strong>Dompet Produsen:</strong> {detail.manufacturer.slice(0, 8)}...{detail.manufacturer.slice(-6)}</div>
                </div>
              </div>
            )}

            {/* Checkpoint Timeline */}
            {checkpoints.length > 0 && (
              <div>
                <h4 style={{ margin: "0 0 12px 0", color: "#1e293b" }}>Riwayat Perjalanan Rantai Pasok</h4>
                <div style={{ borderLeft: "2px solid #3b82f6", paddingLeft: "16px", marginLeft: "8px" }}>
                  {checkpoints.map((cp, idx) => (
                    <div key={idx} style={{ marginBottom: "16px", position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "-23px",
                          top: "2px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#3b82f6",
                        }}
                      />
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>
                        {cp.stageLabel}
                      </div>
                      <div style={{ fontSize: "13px", color: "#059669", fontWeight: 500 }}>
                        {cp.actorName} ({cp.actorRole})
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        📍 {cp.location} | 🕒 {cp.timestampFormatted}
                      </div>
                      <div style={{ fontSize: "13px", color: "#334155", fontStyle: "italic", marginTop: "4px" }}>
                        "{cp.notes}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
