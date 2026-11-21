/**
 * OBTENTIK - Network Configuration for Polygon Amoy Testnet
 * Chain ID: 80002 (Hex: 0x13882)
 */

export interface ChainConfig {
  chainId: number;
  chainIdHex: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: readonly string[];
  blockExplorerUrls: readonly string[];
  faucetUrls: readonly string[];
}

/**
 * Polygon Amoy Testnet Specification
 */
export const POLYGON_AMOY_CHAIN: ChainConfig = {
  chainId: 80002,
  chainIdHex: "0x13882",
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: [
    "https://polygon-amoy-bor-rpc.publicnode.com",
    "https://polygon-amoy.drpc.org",
    "https://polygon-amoy.gateway.tenderly.co",
    "https://rpc-amoy.polygon.technology/",
  ] as const,
  blockExplorerUrls: [
    "https://amoy.polygonscan.com",
  ] as const,
  faucetUrls: [
    "https://faucet.polygon.technology/",
    "https://faucets.chain.link/polygon-amoy",
  ] as const,
};

/**
 * Default Contract Address on Polygon Amoy
 * Fallback if NEXT_PUBLIC_OBTENTIK_CONTRACT_ADDRESS is not provided
 */
export const DEFAULT_OBTENTIK_ADDRESS = "0x511251E3b80e72d437E479B6D6039992Db813049";

/**
 * Get active contract address from environment variable or default
 */
export function getContractAddress(): string {
  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_OBTENTIK_CONTRACT_ADDRESS) {
      return process.env.NEXT_PUBLIC_OBTENTIK_CONTRACT_ADDRESS;
    }
    if (process.env.OBTENTIK_CONTRACT_ADDRESS) {
      return process.env.OBTENTIK_CONTRACT_ADDRESS;
    }
  }
  return DEFAULT_OBTENTIK_ADDRESS;
}

/**
 * Get primary or fallback RPC URL
 */
export function getPublicRpcUrl(index = 0): string {
  const rpcUrls = getPublicRpcUrls();
  return rpcUrls[((index % rpcUrls.length) + rpcUrls.length) % rpcUrls.length];
}

export function getPublicRpcUrlCount(): number {
  return getPublicRpcUrls().length;
}

function getPublicRpcUrls(): readonly string[] {
  const configuredRpc =
    typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_POLYGON_AMOY_RPC : undefined;
  return configuredRpc
    ? [configuredRpc, ...POLYGON_AMOY_CHAIN.rpcUrls]
    : POLYGON_AMOY_CHAIN.rpcUrls;
}

/**
 * Helper to build Polygonscan transaction explorer link
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${POLYGON_AMOY_CHAIN.blockExplorerUrls[0]}/tx/${txHash}`;
}

/**
 * Helper to build Polygonscan address explorer link
 */
export function getExplorerAddressUrl(address: string): string {
  return `${POLYGON_AMOY_CHAIN.blockExplorerUrls[0]}/address/${address}`;
}

/**
 * Validates if the given chainId corresponds to Polygon Amoy
 */
export function isPolygonAmoy(chainId: number | string | bigint | null | undefined): boolean {
  if (!chainId) return false;
  if (typeof chainId === "string") {
    return (
      chainId.toLowerCase() === POLYGON_AMOY_CHAIN.chainIdHex.toLowerCase() ||
      parseInt(chainId, 16) === POLYGON_AMOY_CHAIN.chainId ||
      parseInt(chainId, 10) === POLYGON_AMOY_CHAIN.chainId
    );
  }
  return Number(chainId) === POLYGON_AMOY_CHAIN.chainId;
}
