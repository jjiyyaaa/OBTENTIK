/**
 * OBTENTIK - MetaMask Connector & Network Management
 * Handles wallet connection, auto switch/add chain to Polygon Amoy (80002 / 0x13882),
 * and listener registration for account and chain updates.
 */

import { BrowserProvider, JsonRpcSigner } from "ethers";
import { POLYGON_AMOY_CHAIN, getExplorerTxUrl, isPolygonAmoy } from "./chains";
import { decodeContractError } from "./errors";
import { getActorName, getUserRole } from "./readonly";
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
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

/**
 * Gets a BrowserProvider from window.ethereum
 */
export function getBrowserProvider(): BrowserProvider {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask tidak terdeteksi. Silakan pasang ekstensi MetaMask di browser Anda.");
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * Automatically switches or adds the Polygon Amoy Testnet (Chain ID 80002 / 0x13882) in MetaMask
 */
export async function switchToPolygonAmoy(): Promise<boolean> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask tidak terdeteksi.");
  }

  try {
    // 1. Try to switch to Polygon Amoy
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_AMOY_CHAIN.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 indicates that the chain has not been added to MetaMask yet
    if (
      switchError.code === 4902 ||
      switchError.message?.includes("wallet_addEthereumChain") ||
      switchError.message?.includes("Unrecognized chain ID")
    ) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: POLYGON_AMOY_CHAIN.chainIdHex,
              chainName: POLYGON_AMOY_CHAIN.chainName,
              nativeCurrency: POLYGON_AMOY_CHAIN.nativeCurrency,
              rpcUrls: [...POLYGON_AMOY_CHAIN.rpcUrls],
              blockExplorerUrls: [...POLYGON_AMOY_CHAIN.blockExplorerUrls],
            },
          ],
        });
        return true;
      } catch (addError: any) {
        throw new Error(
          `Gagal menambahkan jaringan Polygon Amoy ke MetaMask: ${decodeContractError(addError)}`
        );
      }
    }

    // User rejected chain switch request
    if (switchError.code === 4001) {
      throw new Error("Permintaan pindah jaringan ke Polygon Amoy ditolak oleh pengguna.");
    }

    throw new Error(
      `Gagal berpindah jaringan ke Polygon Amoy: ${decodeContractError(switchError)}`
    );
  }
}

/**
 * Connects to MetaMask, switches to Polygon Amoy, and retrieves user profile (role + name)
 */
export async function connectMetaMask(): Promise<MetaMaskConnectionResult> {
  if (!isMetaMaskInstalled()) {
    throw new Error(
      "MetaMask tidak terdeteksi di browser ini. Mohon gunakan browser dengan ekstensi MetaMask."
    );
  }

  // 1. Request account access
  const accounts: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("Tidak ada akun yang dipilih di MetaMask.");
  }

  const account = accounts[0];

  // 2. Check and ensure chain is Polygon Amoy
  const currentChainHex: string = await window.ethereum.request({
    method: "eth_chainId",
  });

  let isCorrect = isPolygonAmoy(currentChainHex);

  if (!isCorrect) {
    await switchToPolygonAmoy();
    isCorrect = true;
  }

  // 3. Initialize ethers BrowserProvider & Signer
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(account);
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  // 4. Read User Role and Whitelisted Actor Name from Smart Contract
  const [role, actorName] = await Promise.all([
    getUserRole(account),
    getActorName(account),
  ]);

  return {
    account,
    provider,
    signer,
    chainId,
    isCorrectNetwork: isPolygonAmoy(chainId),
    role,
    actorName,
  };
}

/**
 * Subscribes to MetaMask events (account changes, chain changes, disconnect)
 */
export function setupMetaMaskListeners(callbacks: {
  onAccountChanged?: (accounts: string[]) => void;
  onChainChanged?: (chainIdHex: string) => void;
  onDisconnect?: (error: any) => void;
}): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const { onAccountChanged, onChainChanged, onDisconnect } = callbacks;

  if (onAccountChanged) {
    window.ethereum.on("accountsChanged", onAccountChanged);
  }
  if (onChainChanged) {
    window.ethereum.on("chainChanged", onChainChanged);
  }
  if (onDisconnect) {
    window.ethereum.on("disconnect", onDisconnect);
  }

  // Return unsubscribe cleanup function
  return () => {
    if (!isMetaMaskInstalled()) return;
    if (onAccountChanged) {
      window.ethereum.removeListener("accountsChanged", onAccountChanged);
    }
    if (onChainChanged) {
      window.ethereum.removeListener("chainChanged", onChainChanged);
    }
    if (onDisconnect) {
      window.ethereum.removeListener("disconnect", onDisconnect);
    }
  };
}
