/**
 * OBTENTIK - MetaMask Connector & Network Management
 * Handles wallet connection, auto switch/add chain to Polygon Amoy (80002 / 0x13882),
 * and listener registration for account and chain updates.
 */
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { UserRole } from "./types";
declare global {
    interface Window {
        ethereum?: any;
    }
}
export interface MetaMaskConnectionResult {
    account: string;
    provider: BrowserProvider;
    signer: JsonRpcSigner;
    chainId: number;
    isCorrectNetwork: boolean;
    role: UserRole;
    actorName: string;
}
/**
 * Checks if MetaMask / an Ethereum provider is installed in the browser
 */
export declare function isMetaMaskInstalled(): boolean;
/**
 * Gets a BrowserProvider from window.ethereum
 */
export declare function getBrowserProvider(): BrowserProvider;
/**
 * Automatically switches or adds the Polygon Amoy Testnet (Chain ID 80002 / 0x13882) in MetaMask
 */
export declare function switchToPolygonAmoy(): Promise<boolean>;
/**
 * Connects to MetaMask, switches to Polygon Amoy, and retrieves user profile (role + name)
 */
export declare function connectMetaMask(): Promise<MetaMaskConnectionResult>;
/**
 * Subscribes to MetaMask events (account changes, chain changes, disconnect)
 */
export declare function setupMetaMaskListeners(callbacks: {
    onAccountChanged?: (accounts: string[]) => void;
    onChainChanged?: (chainIdHex: string) => void;
    onDisconnect?: (error: any) => void;
}): () => void;
