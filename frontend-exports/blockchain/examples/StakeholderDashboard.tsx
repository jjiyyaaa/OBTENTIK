"use client";

/**
 * OBTENTIK - Stakeholder Dashboard Example Component (Next.js)
 * Implements Feature (2):
 * - MetaMask wallet connection & network status (Polygon Amoy 80002)
 * - Auto role detection (ADMIN, MANUFACTURER, DISTRIBUTOR, PHARMACY, CONSUMER) & actorNames
 * - Genuine transaction signing: registerManufacturer, registerDistributor,
 *   registerPharmacy, registerBatch, addCheckpoint / verifyCheckpoint, setBatchRecallStatus.
 */

import React, { useState } from "react";
import { useObtentik } from "../index";

export default function StakeholderDashboard() {
  const {
    account,
    chainId,
    isCorrectNetwork,
    isConnected,
    isConnecting,
    role,
    actorName,
    error,
    connect,
    disconnect,
    switchToAmoy,
    registerBatch,
    addCheckpoint,
    setBatchRecallStatus,
    registerManufacturer,
    registerDistributor,
    registerPharmacy,
  } = useObtentik();

  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [batchForm, setBatchForm] = useState({
    batchId: "BATCH-2026-AMOY01",
    productName: "Paracetamol 500mg Kaplet",
    bpomNumber: "DKL1234567890A1",
    lotNumber: "LOT-202604-01",
    productionDaysAgo: 1,
    expiryYearsAhead: 3,
    facilityLocation: "Pabrik Kimia Farma Plant Banjaran, Bandung",
    initialNotes: "Passed BPOM Good Manufacturing Practice (CPOB)",
  });

  const [checkpointForm, setCheckpointForm] = useState({
    batchId: "BATCH-2026-AMOY01",
    location: "Gudang Distribusi PBF Kimia Farma, Cikarang",
    notes: "Suhu penyimpanan terpantau 20-25 C, kemasan utuh",
  });

  const [recallForm, setRecallForm] = useState({
    batchId: "BATCH-2026-AMOY01",
    isRecalled: true,
    recallReason: "Peringatan mutu BPOM: Terindikasi degradasi kemasan sekunder",
  });

  const [whitelistForm, setWhitelistForm] = useState({
    account: "",
    name: "",
    targetRole: "MANUFACTURER" as "MANUFACTURER" | "DISTRIBUTOR" | "PHARMACY",
  });

  // Handle Register Batch (Manufacturer)
  const handleRegisterBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTxStatus("Mengirim transaksi registerBatch ke MetaMask...");
    setTxError(null);
    setTxUrl(null);

    try {
      const now = Math.floor(Date.now() / 1000);
      const prodEpoch = now - batchForm.productionDaysAgo * 86400;
      const expEpoch = now + batchForm.expiryYearsAhead * 365 * 86400;

      const result = await registerBatch({
        batchId: batchForm.batchId,
        productName: batchForm.productName,
        bpomNumber: batchForm.bpomNumber,
        lotNumber: batchForm.lotNumber,
        productionDate: prodEpoch,
        expiryDate: expEpoch,
        facilityLocation: batchForm.facilityLocation,
        initialNotes: batchForm.initialNotes,
      });

      setTxStatus(`✅ Batch obat berhasil didaftarkan di blok #${result.blockNumber}!`);
      setTxUrl(result.explorerUrl);
    } catch (err: any) {
      setTxError(err.message);
      setTxStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Checkpoint (Distributor / Pharmacy)
  const handleAddCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTxStatus("Mengirim transaksi checkpoint ke blockchain...");
    setTxError(null);
    setTxUrl(null);

    try {
      const result = await addCheckpoint({
        batchId: checkpointForm.batchId,
        location: checkpointForm.location,
        notes: checkpointForm.notes,
      });

      setTxStatus(`✅ Checkpoint berhasil dicatat di blok #${result.blockNumber}!`);
      setTxUrl(result.explorerUrl);
    } catch (err: any) {
      setTxError(err.message);
      setTxStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Batch Recall (Admin / Manufacturer)
  const handleRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTxStatus("Mengirim perubahan status recall ke blockchain...");
    setTxError(null);
    setTxUrl(null);

    try {
      const result = await setBatchRecallStatus({
        batchId: recallForm.batchId,
        isRecalled: recallForm.isRecalled,
        recallReason: recallForm.recallReason,
      });

      setTxStatus(`✅ Status recall berhasil diperbarui di blok #${result.blockNumber}!`);
      setTxUrl(result.explorerUrl);
    } catch (err: any) {
      setTxError(err.message);
      setTxStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Whitelist Registration (Admin)
  const handleWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTxStatus(`Mendaftarkan ${whitelistForm.targetRole} ke smart contract...`);
    setTxError(null);
    setTxUrl(null);

    try {
      let result;
      if (whitelistForm.targetRole === "MANUFACTURER") {
        result = await registerManufacturer(whitelistForm.account, whitelistForm.name);
      } else if (whitelistForm.targetRole === "DISTRIBUTOR") {
        result = await registerDistributor(whitelistForm.account, whitelistForm.name);
      } else {
        result = await registerPharmacy(whitelistForm.account, whitelistForm.name);
      }

      setTxStatus(`✅ Entitas berhasil di-whitelist di blok #${result.blockNumber}!`);
      setTxUrl(result.explorerUrl);
    } catch (err: any) {
      setTxError(err.message);
      setTxStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px", fontFamily: "sans-serif" }}>
      {/* Wallet Connection Bar */}
      <div style={{ background: "#0f172a", color: "white", padding: "20px", borderRadius: "12px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>OBTENTIK Portal Stakeholder</h2>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>
              Jaringan: Polygon Amoy Testnet (Chain ID 80002 / 0x13882)
            </div>
          </div>

          <div>
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={isConnecting}
                style={{
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: isConnecting ? "wait" : "pointer",
                }}
              >
                {isConnecting ? "Menghubungkan..." : "Hubungkan MetaMask"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {!isCorrectNetwork && (
                  <button
                    onClick={switchToAmoy}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Pindah ke Polygon Amoy
                  </button>
                )}
                <button
                  onClick={disconnect}
                  style={{
                    background: "#334155",
                    color: "#e2e8f0",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {isConnected && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1e293b", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Alamat Terhubung:</span>{" "}
              <code>{account?.slice(0, 10)}...{account?.slice(-6)}</code>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Peran On-Chain:</span>{" "}
              <strong style={{ color: "#38bdf8" }}>{role}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Nama Instansi:</span>{" "}
              <strong>{actorName || "Belum Terdaftar / Consumer"}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Status Jaringan:</span>{" "}
              <span style={{ color: isCorrectNetwork ? "#4ade80" : "#f87171" }}>
                {isCorrectNetwork ? "✅ Terhubung ke Polygon Amoy" : "❌ Jaringan Salah"}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: "12px", padding: "8px 12px", background: "#7f1d1d", color: "#fecaca", borderRadius: "6px", fontSize: "13px" }}>
            {error}
          </div>
        )}
      </div>

      {/* Live Transaction Feedback */}
      {txStatus && (
        <div style={{ padding: "14px", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: "8px", marginBottom: "20px" }}>
          <div>{txStatus}</div>
          {txUrl && (
            <div style={{ marginTop: "6px" }}>
              <a href={txUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "underline" }}>
                Lihat Transaksi di Polygonscan Amoy ↗
              </a>
            </div>
          )}
        </div>
      )}

      {txError && (
        <div style={{ padding: "14px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: "8px", marginBottom: "20px" }}>
          ❌ {txError}
        </div>
      )}

      {/* Role-Specific Actions */}
      {isConnected && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* 1. Manufacturer Section */}
          {(role === "MANUFACTURER" || role === "ADMIN") && (
            <div style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px 0", color: "#1e293b" }}>🏭 Registrasi Batch Obat Baru (Manufacturer)</h3>
              <form onSubmit={handleRegisterBatch} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Batch ID</label>
                  <input
                    type="text"
                    value={batchForm.batchId}
                    onChange={(e) => setBatchForm({ ...batchForm, batchId: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Nama Obat</label>
                  <input
                    type="text"
                    value={batchForm.productName}
                    onChange={(e) => setBatchForm({ ...batchForm, productName: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Nomor Izin BPOM</label>
                  <input
                    type="text"
                    value={batchForm.bpomNumber}
                    onChange={(e) => setBatchForm({ ...batchForm, bpomNumber: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Nomor Lot</label>
                  <input
                    type="text"
                    value={batchForm.lotNumber}
                    onChange={(e) => setBatchForm({ ...batchForm, lotNumber: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Lokasi Pabrik Produksi</label>
                  <input
                    type="text"
                    value={batchForm.facilityLocation}
                    onChange={(e) => setBatchForm({ ...batchForm, facilityLocation: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 20px",
                      fontWeight: 600,
                      cursor: isSubmitting ? "wait" : "pointer",
                    }}
                  >
                    {isSubmitting ? "Memproses Tanda Tangan..." : "Tandatangani & Daftarkan Batch (On-Chain)"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. Checkpoint Section (Distributor / Pharmacy) */}
          {(role === "DISTRIBUTOR" || role === "PHARMACY" || role === "ADMIN") && (
            <div style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px 0", color: "#1e293b" }}>
                🚚 Catat Checkpoint Rantai Pasok ({role})
              </h3>
              <form onSubmit={handleAddCheckpoint} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Batch ID Yang Diterima</label>
                  <input
                    type="text"
                    value={checkpointForm.batchId}
                    onChange={(e) => setCheckpointForm({ ...checkpointForm, batchId: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Lokasi Penerimaan / Gudang / Apotek</label>
                  <input
                    type="text"
                    value={checkpointForm.location}
                    onChange={(e) => setCheckpointForm({ ...checkpointForm, location: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Catatan Pemeriksaan Mutu (QC Notes)</label>
                  <input
                    type="text"
                    value={checkpointForm.notes}
                    onChange={(e) => setCheckpointForm({ ...checkpointForm, notes: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 20px",
                      fontWeight: 600,
                      cursor: isSubmitting ? "wait" : "pointer",
                    }}
                  >
                    {isSubmitting ? "Memproses Checkpoint..." : "Kirim Checkpoint On-Chain"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. Recall Management Section */}
          {(role === "MANUFACTURER" || role === "ADMIN") && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px 0", color: "#9f1239" }}>🚨 Manajemen Batch Recall (Emergency Action)</h3>
              <form onSubmit={handleRecall} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Batch ID Yang Hendak Ditarik</label>
                  <input
                    type="text"
                    value={recallForm.batchId}
                    onChange={(e) => setRecallForm({ ...recallForm, batchId: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Alasan Penarikan Obat (Recall Reason)</label>
                  <input
                    type="text"
                    value={recallForm.recallReason}
                    onChange={(e) => setRecallForm({ ...recallForm, recallReason: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: "#e11d48",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 20px",
                      fontWeight: 600,
                      cursor: isSubmitting ? "wait" : "pointer",
                    }}
                  >
                    {isSubmitting ? "Memproses Penarikan..." : "Eksekusi Recall Batch (On-Chain)"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. Admin Whitelist Section */}
          {role === "ADMIN" && (
            <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px 0", color: "#5b21b6" }}>👑 Whitelist Management (Admin Portal)</h3>
              <form onSubmit={handleWhitelist} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Peran Yang Diberikan</label>
                  <select
                    value={whitelistForm.targetRole}
                    onChange={(e: any) => setWhitelistForm({ ...whitelistForm, targetRole: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  >
                    <option value="MANUFACTURER">MANUFACTURER (Pabrik Farmasi)</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR (PBF Resmi)</option>
                    <option value="PHARMACY">PHARMACY (Apotek Berlisensi)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Nama Resmi Instansi</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Kimia Farma Tbk"
                    value={whitelistForm.name}
                    onChange={(e) => setWhitelistForm({ ...whitelistForm, name: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Alamat Dompet (0x...)</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={whitelistForm.account}
                    onChange={(e) => setWhitelistForm({ ...whitelistForm, account: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: "#7c3aed",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 20px",
                      fontWeight: 600,
                      cursor: isSubmitting ? "wait" : "pointer",
                    }}
                  >
                    {isSubmitting ? "Menambahkan ke Whitelist..." : "Daftarkan Entitas ke Smart Contract"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
