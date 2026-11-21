"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useObtentik = useObtentik;
/**
 * OBTENTIK - Custom Hook for Next.js Components
 * Seamlessly exposes the OBTENTIK smart contract methods and MetaMask state.
 */
const ObtentikContext_1 = require("./ObtentikContext");
/**
 * Main hook for components in Next.js
 *
 * @example
 * ```tsx
 * const {
 *   account,
 *   role,
 *   actorName,
 *   isConnected,
 *   connect,
 *   verifyBatch,
 *   registerBatch
 * } = useObtentik();
 * ```
 */
function useObtentik() {
    return (0, ObtentikContext_1.useObtentikContext)();
}
exports.default = useObtentik;
