"use client";

/**
 * OBTENTIK - Custom Hook for Next.js Components
 * Seamlessly exposes the OBTENTIK smart contract methods and MetaMask state.
 */

import { useObtentikContext } from "./ObtentikContext";
import type { ObtentikContextValue } from "./ObtentikContext";

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
export function useObtentik(): ObtentikContextValue {
  return useObtentikContext();
}

export default useObtentik;
