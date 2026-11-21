"use strict";
/**
 * OBTENTIK - Blockchain Types Definition
 * Polygon Amoy Testnet (Chain ID 80002 / 0x13882)
 * Smart Contract: ObtentikSupplyChain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAGE_LABELS = exports.SupplyChainStage = void 0;
/**
 * Supply chain stages corresponding to ObtentikSupplyChain.SupplyChainStage enum
 */
var SupplyChainStage;
(function (SupplyChainStage) {
    SupplyChainStage[SupplyChainStage["Manufactured"] = 0] = "Manufactured";
    SupplyChainStage[SupplyChainStage["Distributed"] = 1] = "Distributed";
    SupplyChainStage[SupplyChainStage["AtPharmacy"] = 2] = "AtPharmacy";
})(SupplyChainStage || (exports.SupplyChainStage = SupplyChainStage = {}));
/**
 * Human-readable mapping for supply chain stages
 */
exports.STAGE_LABELS = {
    [SupplyChainStage.Manufactured]: "Diproduksi (Manufacturer)",
    [SupplyChainStage.Distributed]: "Didistribusikan (Distributor)",
    [SupplyChainStage.AtPharmacy]: "Tersedia di Apotek (Pharmacy)",
};
