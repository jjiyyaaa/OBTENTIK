"use strict";
/**
 * OBTENTIK - Blockchain Connection Module for Next.js
 * Polygon Amoy Testnet (Chain ID 80002 / 0x13882)
 * Smart Contract: ObtentikSupplyChain
 */
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBTENTIK_ABI = exports.OBTENTIK_EXPLORER_URL = exports.OBTENTIK_NETWORK_NAME = exports.OBTENTIK_CHAIN_ID = exports.OBTENTIK_CONTRACT_ADDRESS = void 0;
// Types & Enums
__exportStar(require("./types"), exports);
// Chain & Contract Configurations
__exportStar(require("./chains"), exports);
// Error Handlers
__exportStar(require("./errors"), exports);
// Public Read-Only Methods (Zero wallet / free for Consumers)
__exportStar(require("./readonly"), exports);
// MetaMask Wallet Connection & Network Management
__exportStar(require("./metamask"), exports);
// Authenticated On-Chain Transactions (Real signatures, no mocks)
__exportStar(require("./transactions"), exports);
// React Context, Provider & Hooks for Next.js
__exportStar(require("./ObtentikContext"), exports);
__exportStar(require("./useObtentik"), exports);
// Re-export contract configuration constants
var ObtentikConfig_1 = require("../ObtentikConfig");
Object.defineProperty(exports, "OBTENTIK_CONTRACT_ADDRESS", { enumerable: true, get: function () { return ObtentikConfig_1.OBTENTIK_CONTRACT_ADDRESS; } });
Object.defineProperty(exports, "OBTENTIK_CHAIN_ID", { enumerable: true, get: function () { return ObtentikConfig_1.OBTENTIK_CHAIN_ID; } });
Object.defineProperty(exports, "OBTENTIK_NETWORK_NAME", { enumerable: true, get: function () { return ObtentikConfig_1.OBTENTIK_NETWORK_NAME; } });
Object.defineProperty(exports, "OBTENTIK_EXPLORER_URL", { enumerable: true, get: function () { return ObtentikConfig_1.OBTENTIK_EXPLORER_URL; } });
Object.defineProperty(exports, "OBTENTIK_ABI", { enumerable: true, get: function () { return ObtentikConfig_1.OBTENTIK_ABI; } });
