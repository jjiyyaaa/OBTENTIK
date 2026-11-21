/**
 * OBTENTIK - Blockchain Connection Module for Next.js
 * Polygon Amoy Testnet (Chain ID 80002 / 0x13882)
 * Smart Contract: ObtentikSupplyChain
 */

// Types & Enums
export * from "./types";

// Chain & Contract Configurations
export * from "./chains";

// Error Handlers
export * from "./errors";

// Public Read-Only Methods (Zero wallet / free for Consumers)
export * from "./readonly";

// MetaMask Wallet Connection & Network Management
export * from "./metamask";

// Authenticated On-Chain Transactions (Real signatures, no mocks)
export * from "./transactions";

// React Context, Provider & Hooks for Next.js
export * from "./ObtentikContext";
export * from "./useObtentik";

// Re-export contract configuration constants
export {
  OBTENTIK_CONTRACT_ADDRESS,
  OBTENTIK_CHAIN_ID,
  OBTENTIK_NETWORK_NAME,
  OBTENTIK_EXPLORER_URL,
  OBTENTIK_ABI,
} from "../ObtentikConfig";
