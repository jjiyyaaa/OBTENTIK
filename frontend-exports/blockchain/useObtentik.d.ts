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
export declare function useObtentik(): ObtentikContextValue;
export default useObtentik;
