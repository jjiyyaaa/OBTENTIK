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
exports.default = ConsumerVerification;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * OBTENTIK - Consumer Verification Example Component (Next.js)
 * Implements Feature (1): Read-only batch verification without wallet / login.
 * Consumers simply scan or type a Batch ID to query Polygon Amoy Testnet directly.
 */
const react_1 = __importStar(require("react"));
const index_1 = require("../index");
function ConsumerVerification() {
    const [batchIdInput, setBatchIdInput] = (0, react_1.useState)("BATCH-2026-PARA500");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [verification, setVerification] = (0, react_1.useState)(null);
    const [detail, setDetail] = (0, react_1.useState)(null);
    const [checkpoints, setCheckpoints] = (0, react_1.useState)([]);
    const [errorMsg, setErrorMsg] = (0, react_1.useState)(null);
    const handleVerify = async (e) => {
        e.preventDefault();
        if (!batchIdInput.trim())
            return;
        setLoading(true);
        setErrorMsg(null);
        try {
            // 1. Instant check on Polygon Amoy without wallet
            const verResult = await (0, index_1.verifyBatch)(batchIdInput);
            setVerification(verResult);
            if (verResult.isValid) {
                // 2. Fetch full details and timeline
                const [batchDetail, timeline] = await Promise.all([
                    (0, index_1.getBatchDetail)(batchIdInput),
                    (0, index_1.getBatchCheckpoints)(batchIdInput),
                ]);
                setDetail(batchDetail);
                setCheckpoints(timeline);
            }
            else {
                setDetail(null);
                setCheckpoints([]);
            }
        }
        catch (err) {
            setErrorMsg(err.message || "Gagal memverifikasi obat ke blockchain.");
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: { maxWidth: "720px", margin: "0 auto", padding: "24px", fontFamily: "sans-serif" }, children: (0, jsx_runtime_1.jsxs)("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { color: "#0f172a", marginBottom: "8px" }, children: "\uD83D\uDD0D Verifikasi Keaslian Obat OBTENTIK" }), (0, jsx_runtime_1.jsxs)("p", { style: { color: "#64748b", fontSize: "14px", marginTop: 0 }, children: ["Pemeriksaan langsung ke Polygon Amoy Testnet (Chain ID 80002).", (0, jsx_runtime_1.jsx)("strong", { children: " Tanpa perlu login, tanpa wallet, dan 100% gratis." })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleVerify, style: { display: "flex", gap: "8px", marginTop: "16px" }, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: batchIdInput, onChange: (e) => setBatchIdInput(e.target.value), placeholder: "Masukkan ID Batch (contoh: BATCH-2026-PARA500)", style: {
                                flex: 1,
                                padding: "10px 14px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                fontSize: "14px",
                            } }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, style: {
                                background: "#2563eb",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px 20px",
                                fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer",
                            }, children: loading ? "Memverifikasi..." : "Verifikasi" })] }), errorMsg && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: "16px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px" }, children: ["\u274C ", errorMsg] })), verification && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: "24px" }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                padding: "16px",
                                borderRadius: "8px",
                                background: verification.isSafeForConsumption ? "#f0fdf4" : "#fef2f2",
                                border: `1px solid ${verification.isSafeForConsumption ? "#86efac" : "#fca5a5"}`,
                                marginBottom: "20px",
                            }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: "0 0 6px 0", color: verification.isSafeForConsumption ? "#166534" : "#991b1b" }, children: verification.isSafeForConsumption
                                        ? "✅ PRODUK RESMI & ASLI (OTENTIK)"
                                        : verification.isRecalled
                                            ? "⚠️ PERINGATAN: OBAT DITARIK DARI PEREDARAN (RECALLED)"
                                            : verification.isExpired
                                                ? "⚠️ PRODUK TELAH KEDALUWARSA"
                                                : "❌ BATCH TIDAK TERDAFTAR" }), (0, jsx_runtime_1.jsx)("p", { style: { margin: 0, fontSize: "14px", color: verification.isSafeForConsumption ? "#15803d" : "#b91c1c" }, children: verification.statusMessage }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: "8px", fontSize: "13px", color: "#475569" }, children: ["Posisi Rantai Pasok Saat Ini: ", (0, jsx_runtime_1.jsx)("strong", { children: verification.currentStageLabel }), " | Total Checkpoint: ", (0, jsx_runtime_1.jsx)("strong", { children: verification.checkpointCount })] })] }), detail && ((0, jsx_runtime_1.jsxs)("div", { style: { background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", marginBottom: "20px" }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: "0 0 12px 0", color: "#1e293b" }, children: "Informasi Produk Farmasi" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Nama Obat:" }), " ", detail.productName] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Nomor Izin BPOM:" }), " ", detail.bpomNumber] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Nomor Lot:" }), " ", detail.lotNumber] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Tanggal Produksi:" }), " ", detail.productionDateFormatted] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Tanggal Kedaluwarsa:" }), " ", detail.expiryDateFormatted] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Dompet Produsen:" }), " ", detail.manufacturer.slice(0, 8), "...", detail.manufacturer.slice(-6)] })] })] })), checkpoints.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: "0 0 12px 0", color: "#1e293b" }, children: "Riwayat Perjalanan Rantai Pasok" }), (0, jsx_runtime_1.jsx)("div", { style: { borderLeft: "2px solid #3b82f6", paddingLeft: "16px", marginLeft: "8px" }, children: checkpoints.map((cp, idx) => ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: "16px", position: "relative" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                    position: "absolute",
                                                    left: "-23px",
                                                    top: "2px",
                                                    width: "12px",
                                                    height: "12px",
                                                    borderRadius: "50%",
                                                    background: "#3b82f6",
                                                } }), (0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600, color: "#1e293b" }, children: cp.stageLabel }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: "13px", color: "#059669", fontWeight: 500 }, children: [cp.actorName, " (", cp.actorRole, ")"] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: "13px", color: "#64748b" }, children: ["\uD83D\uDCCD ", cp.location, " | \uD83D\uDD52 ", cp.timestampFormatted] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: "13px", color: "#334155", fontStyle: "italic", marginTop: "4px" }, children: ["\"", cp.notes, "\""] })] }, idx))) })] }))] }))] }) }));
}
