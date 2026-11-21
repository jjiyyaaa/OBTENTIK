"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StakeholderDashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * OBTENTIK - Stakeholder Dashboard Example Component (Next.js)
 * Implements Feature (2):
 * - MetaMask wallet connection & network status (Polygon Amoy 80002)
 * - Auto role detection (ADMIN, MANUFACTURER, DISTRIBUTOR, PHARMACY, CONSUMER) & actorNames
 * - Genuine transaction signing: registerManufacturer, registerDistributor,
 *   registerPharmacy, registerBatch, addCheckpoint / verifyCheckpoint, setBatchRecallStatus.
 */
const react_1 = __importStar(require("react"));
const index_1 = require("../index");
function StakeholderDashboard() {
    const { account, chainId, isCorrectNetwork, isConnected, isConnecting, role, actorName, error, connect, disconnect, switchToAmoy, registerBatch, addCheckpoint, setBatchRecallStatus, registerManufacturer, registerDistributor, registerPharmacy, } = (0, index_1.useObtentik)();
    const [txStatus, setTxStatus] = (0, react_1.useState)(null);
    const [txUrl, setTxUrl] = (0, react_1.useState)(null);
    const [txError, setTxError] = (0, react_1.useState)(null);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    // Form States
    const [batchForm, setBatchForm] = (0, react_1.useState)({
        batchId: "BATCH-2026-AMOY01",
        productName: "Paracetamol 500mg Kaplet",
        bpomNumber: "DKL1234567890A1",
        lotNumber: "LOT-202604-01",
        productionDaysAgo: 1,
        expiryYearsAhead: 3,
        facilityLocation: "Pabrik Kimia Farma Plant Banjaran, Bandung",
        initialNotes: "Passed BPOM Good Manufacturing Practice (CPOB)",
    });
    const [checkpointForm, setCheckpointForm] = (0, react_1.useState)({
        batchId: "BATCH-2026-AMOY01",
        location: "Gudang Distribusi PBF Kimia Farma, Cikarang",
        notes: "Suhu penyimpanan terpantau 20-25 C, kemasan utuh",
    });
    const [recallForm, setRecallForm] = (0, react_1.useState)({
        batchId: "BATCH-2026-AMOY01",
        isRecalled: true,
        recallReason: "Peringatan mutu BPOM: Terindikasi degradasi kemasan sekunder",
    });
    const [whitelistForm, setWhitelistForm] = (0, react_1.useState)({
        account: "",
        name: "",
        targetRole: "MANUFACTURER",
    });
    // Handle Register Batch (Manufacturer)
    const handleRegisterBatch = async (e) => {
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
        }
        catch (err) {
            setTxError(err.message);
            setTxStatus(null);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Handle Add Checkpoint (Distributor / Pharmacy)
    const handleAddCheckpoint = async (e) => {
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
        }
        catch (err) {
            setTxError(err.message);
            setTxStatus(null);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Handle Batch Recall (Admin / Manufacturer)
    const handleRecall = async (e) => {
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
        }
        catch (err) {
            setTxError(err.message);
            setTxStatus(null);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Handle Whitelist Registration (Admin)
    const handleWhitelist = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTxStatus(`Mendaftarkan ${whitelistForm.targetRole} ke smart contract...`);
        setTxError(null);
        setTxUrl(null);
        try {
            let result;
            if (whitelistForm.targetRole === "MANUFACTURER") {
                result = await registerManufacturer(whitelistForm.account, whitelistForm.name);
            }
            else if (whitelistForm.targetRole === "DISTRIBUTOR") {
                result = await registerDistributor(whitelistForm.account, whitelistForm.name);
            }
            else {
                result = await registerPharmacy(whitelistForm.account, whitelistForm.name);
            }
            setTxStatus(`✅ Entitas berhasil di-whitelist di blok #${result.blockNumber}!`);
            setTxUrl(result.explorerUrl);
        }
        catch (err) {
            setTxError(err.message);
            setTxStatus(null);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { maxWidth: "800px", margin: "0 auto", padding: "24px", fontFamily: "sans-serif" }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { background: "#0f172a", color: "white", padding: "20px", borderRadius: "12px", marginBottom: "24px" }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { style: { margin: "0 0 4px 0", fontSize: "20px" }, children: "OBTENTIK Portal Stakeholder" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: "13px", color: "#94a3b8" }, children: "Jaringan: Polygon Amoy Testnet (Chain ID 80002 / 0x13882)" })] }), (0, jsx_runtime_1.jsx)("div", { children: !isConnected ? ((0, jsx_runtime_1.jsx)("button", { onClick: connect, disabled: isConnecting, style: {
                                        background: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 18px",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                        cursor: isConnecting ? "wait" : "pointer",
                                    }, children: isConnecting ? "Menghubungkan..." : "Hubungkan MetaMask" })) : ((0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [!isCorrectNetwork && ((0, jsx_runtime_1.jsx)("button", { onClick: switchToAmoy, style: {
                                                background: "#ef4444",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 14px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }, children: "Pindah ke Polygon Amoy" })), (0, jsx_runtime_1.jsx)("button", { onClick: disconnect, style: {
                                                background: "#334155",
                                                color: "#e2e8f0",
                                                border: "none",
                                                padding: "8px 14px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                            }, children: "Disconnect" })] })) })] }), isConnected && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1e293b", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: "#94a3b8" }, children: "Alamat Terhubung:" }), " ", (0, jsx_runtime_1.jsxs)("code", { children: [account?.slice(0, 10), "...", account?.slice(-6)] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: "#94a3b8" }, children: "Peran On-Chain:" }), " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#38bdf8" }, children: role })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: "#94a3b8" }, children: "Nama Instansi:" }), " ", (0, jsx_runtime_1.jsx)("strong", { children: actorName || "Belum Terdaftar / Consumer" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: "#94a3b8" }, children: "Status Jaringan:" }), " ", (0, jsx_runtime_1.jsx)("span", { style: { color: isCorrectNetwork ? "#4ade80" : "#f87171" }, children: isCorrectNetwork ? "✅ Terhubung ke Polygon Amoy" : "❌ Jaringan Salah" })] })] })), error && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: "12px", padding: "8px 12px", background: "#7f1d1d", color: "#fecaca", borderRadius: "6px", fontSize: "13px" }, children: error }))] }), txStatus && ((0, jsx_runtime_1.jsxs)("div", { style: { padding: "14px", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: "8px", marginBottom: "20px" }, children: [(0, jsx_runtime_1.jsx)("div", { children: txStatus }), txUrl && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: "6px" }, children: (0, jsx_runtime_1.jsx)("a", { href: txUrl, target: "_blank", rel: "noopener noreferrer", style: { color: "#2563eb", fontWeight: 600, textDecoration: "underline" }, children: "Lihat Transaksi di Polygonscan Amoy \u2197" }) }))] })), txError && ((0, jsx_runtime_1.jsxs)("div", { style: { padding: "14px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: "8px", marginBottom: "20px" }, children: ["\u274C ", txError] })), isConnected && ((0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "24px" }, children: [(role === "MANUFACTURER" || role === "ADMIN") && ((0, jsx_runtime_1.jsxs)("div", { style: { background: "white", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "20px" }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: "0 0 12px 0", color: "#1e293b" }, children: "\uD83C\uDFED Registrasi Batch Obat Baru (Manufacturer)" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleRegisterBatch, style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Batch ID" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: batchForm.batchId, onChange: (e) => setBatchForm({ ...batchForm, batchId: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Nama Obat" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: batchForm.productName, onChange: (e) => setBatchForm({ ...batchForm, productName: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Nomor Izin BPOM" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: batchForm.bpomNumber, onChange: (e) => setBatchForm({ ...batchForm, bpomNumber: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Nomor Lot" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: batchForm.lotNumber, onChange: (e) => setBatchForm({ ...batchForm, lotNumber: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsxs)("div", { style: { gridColumn: "1 / -1" }, children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Lokasi Pabrik Produksi" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: batchForm.facilityLocation, onChange: (e) => setBatchForm({ ...batchForm, facilityLocation: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsx)("div", { style: { gridColumn: "1 / -1" }, children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isSubmitting, style: {
                                                background: "#16a34a",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "10px 20px",
                                                fontWeight: 600,
                                                cursor: isSubmitting ? "wait" : "pointer",
                                            }, children: isSubmitting ? "Memproses Tanda Tangan..." : "Tandatangani & Daftarkan Batch (On-Chain)" }) })] })] })), (role === "DISTRIBUTOR" || role === "PHARMACY" || role === "ADMIN") && ((0, jsx_runtime_1.jsxs)("div", { style: { background: "white", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "20px" }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { margin: "0 0 12px 0", color: "#1e293b" }, children: ["\uD83D\uDE9A Catat Checkpoint Rantai Pasok (", role, ")"] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleAddCheckpoint, style: { display: "flex", flexDirection: "column", gap: "12px" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Batch ID Yang Diterima" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: checkpointForm.batchId, onChange: (e) => setCheckpointForm({ ...checkpointForm, batchId: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Lokasi Penerimaan / Gudang / Apotek" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: checkpointForm.location, onChange: (e) => setCheckpointForm({ ...checkpointForm, location: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Catatan Pemeriksaan Mutu (QC Notes)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: checkpointForm.notes, onChange: (e) => setCheckpointForm({ ...checkpointForm, notes: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isSubmitting, style: {
                                                background: "#2563eb",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "10px 20px",
                                                fontWeight: 600,
                                                cursor: isSubmitting ? "wait" : "pointer",
                                            }, children: isSubmitting ? "Memproses Checkpoint..." : "Kirim Checkpoint On-Chain" }) })] })] })), (role === "MANUFACTURER" || role === "ADMIN") && ((0, jsx_runtime_1.jsxs)("div", { style: { background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "20px" }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: "0 0 12px 0", color: "#9f1239" }, children: "\uD83D\uDEA8 Manajemen Batch Recall (Emergency Action)" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleRecall, style: { display: "flex", flexDirection: "column", gap: "12px" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Batch ID Yang Hendak Ditarik" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: recallForm.batchId, onChange: (e) => setRecallForm({ ...recallForm, batchId: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Alasan Penarikan Obat (Recall Reason)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: recallForm.recallReason, onChange: (e) => setRecallForm({ ...recallForm, recallReason: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isSubmitting, style: {
                                                background: "#e11d48",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "10px 20px",
                                                fontWeight: 600,
                                                cursor: isSubmitting ? "wait" : "pointer",
                                            }, children: isSubmitting ? "Memproses Penarikan..." : "Eksekusi Recall Batch (On-Chain)" }) })] })] })), role === "ADMIN" && ((0, jsx_runtime_1.jsxs)("div", { style: { background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "10px", padding: "20px" }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: "0 0 12px 0", color: "#5b21b6" }, children: "\uD83D\uDC51 Whitelist Management (Admin Portal)" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleWhitelist, style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Peran Yang Diberikan" }), (0, jsx_runtime_1.jsxs)("select", { value: whitelistForm.targetRole, onChange: (e) => setWhitelistForm({ ...whitelistForm, targetRole: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }, children: [(0, jsx_runtime_1.jsx)("option", { value: "MANUFACTURER", children: "MANUFACTURER (Pabrik Farmasi)" }), (0, jsx_runtime_1.jsx)("option", { value: "DISTRIBUTOR", children: "DISTRIBUTOR (PBF Resmi)" }), (0, jsx_runtime_1.jsx)("option", { value: "PHARMACY", children: "PHARMACY (Apotek Berlisensi)" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Nama Resmi Instansi" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Contoh: PT Kimia Farma Tbk", value: whitelistForm.name, onChange: (e) => setWhitelistForm({ ...whitelistForm, name: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsxs)("div", { style: { gridColumn: "1 / -1" }, children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "12px", fontWeight: 600 }, children: "Alamat Dompet (0x...)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "0x...", value: whitelistForm.account, onChange: (e) => setWhitelistForm({ ...whitelistForm, account: e.target.value }), style: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" } })] }), (0, jsx_runtime_1.jsx)("div", { style: { gridColumn: "1 / -1" }, children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isSubmitting, style: {
                                                background: "#7c3aed",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "10px 20px",
                                                fontWeight: 600,
                                                cursor: isSubmitting ? "wait" : "pointer",
                                            }, children: isSubmitting ? "Menambahkan ke Whitelist..." : "Daftarkan Entitas ke Smart Contract" }) })] })] }))] }))] }));
}
