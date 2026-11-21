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
export declare const POLYGON_AMOY_CHAIN: ChainConfig;
/**
 * Default Contract Address on Polygon Amoy
 * Fallback if NEXT_PUBLIC_OBTENTIK_CONTRACT_ADDRESS is not provided
 */
export declare const DEFAULT_OBTENTIK_ADDRESS = "0x511251E3b80e72d437E479B6D6039992Db813049";
/**
 * Get active contract address from environment variable or default
 */
export declare function getContractAddress(): string;
/**
 * Get primary or fallback RPC URL
 */
export declare function getPublicRpcUrl(index?: number): string;
/**
 * Helper to build Polygonscan transaction explorer link
 */
export declare function getExplorerTxUrl(txHash: string): string;
/**
 * Helper to build Polygonscan address explorer link
 */
export declare function getExplorerAddressUrl(address: string): string;
/**
 * Validates if the given chainId corresponds to Polygon Amoy
 */
export declare function isPolygonAmoy(chainId: number | string | bigint | null | undefined): boolean;
