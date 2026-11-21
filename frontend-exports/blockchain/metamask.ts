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

export interface InjectedEthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: InjectedEthereumProvider;
  }
}

export interface MetaMaskConnectionResult {
  account: string;
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  chainId: number;
  isCorrectNetwork: boolean;
  role: UserRole | null;
  actorName: string;
  profileError: string | null;
}

export function getInjectedProvider(): InjectedEthereumProvider | null {
  if (typeof window === "undefined") return null;
  const ethereum = window.ethereum;
  return ethereum && typeof ethereum.request === "function" ? ethereum : null;
}

/**
 * Checks if MetaMask / an Ethereum provider is installed in the browser
 */
export function isMetaMaskInstalled(): boolean {
  return getInjectedProvider() !== null;
}

/**
 * Gets a BrowserProvider from window.ethereum
 */
export function getBrowserProvider(): BrowserProvider {
  const ethereum = getInjectedProvider();
  if (!ethereum) {
    throw new Error("MetaMask tidak terdeteksi. Silakan pasang ekstensi MetaMask di browser Anda.");
  }
  return new BrowserProvider(ethereum);
}

function isUnsupportedWalletMethod(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const walletError = error as { code?: number; message?: string };
  return (
    walletError.code === -32601 ||
    walletError.code === 4200 ||
    walletError.message?.toLowerCase().includes("not supported") === true ||
    walletError.message?.toLowerCase().includes("method not found") === true
  );
}

async function requestAccountSelection(
  ethereum: InjectedEthereumProvider
): Promise<unknown> {
  try {
    await ethereum.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch (revokeError) {
    if (!isUnsupportedWalletMethod(revokeError)) throw revokeError;

    try {
      await ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (permissionError) {
      if (!isUnsupportedWalletMethod(permissionError)) throw permissionError;
      throw new Error(
        "MetaMask tidak dapat menampilkan pemilih akun. Pilih akun di ekstensi MetaMask, lalu coba hubungkan lagi."
      );
    }
  }

  return ethereum.request({ method: "eth_requestAccounts" });
}

/**
 * Automatically switches or adds the Polygon Amoy Testnet (Chain ID 80002 / 0x13882) in MetaMask
 */
export async function switchToPolygonAmoy(): Promise<boolean> {
  const ethereum = getInjectedProvider();
  if (!ethereum) {
    throw new Error("MetaMask tidak terdeteksi.");
  }

  try {
    // 1. Try to switch to Polygon Amoy
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_AMOY_CHAIN.chainIdHex }],
    });
  } catch (switchError: any) {
    // Error code 4902 indicates that the chain has not been added to MetaMask yet
    if (
      switchError.code === 4902 ||
      switchError.message?.includes("wallet_addEthereumChain") ||
      switchError.message?.includes("Unrecognized chain ID")
    ) {
      try {
        await ethereum.request({
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

  const activeChain = await ethereum.request({ method: "eth_chainId" });
  return typeof activeChain === "string" && isPolygonAmoy(activeChain);
}

/**
 * Connects to MetaMask, switches to Polygon Amoy, and retrieves user profile (role + name)
 */
export async function connectMetaMask(): Promise<MetaMaskConnectionResult> {
  const ethereum = getInjectedProvider();
  if (!ethereum) {
    const secureContextHint =
      typeof window !== "undefined" && !window.isSecureContext
        ? " Untuk akses melalui IP jaringan lokal, buka situs melalui HTTPS atau gunakan localhost."
        : "";
    throw new Error(
      `MetaMask tidak terdeteksi di browser ini. Mohon gunakan browser dengan ekstensi MetaMask.${secureContextHint}`
    );
  }

  // Revoke the prior account grant so MetaMask asks the user to choose an account again.
  const requestedAccounts = await requestAccountSelection(ethereum);
  const accounts = Array.isArray(requestedAccounts)
    ? requestedAccounts.filter((account): account is string => typeof account === "string")
    : [];

  if (!accounts || accounts.length === 0) {
    throw new Error("Tidak ada akun yang dipilih di MetaMask.");
  }

  const account = accounts[0];

  // 2. Check and ensure chain is Polygon Amoy
  const requestedChain = await ethereum.request({
    method: "eth_chainId",
  });
  if (typeof requestedChain !== "string") {
    throw new Error("MetaMask mengembalikan Chain ID yang tidak valid.");
  }
  let currentChainHex: string = requestedChain;

  if (!isPolygonAmoy(currentChainHex)) {
    await switchToPolygonAmoy();
    const switchedChain = await ethereum.request({ method: "eth_chainId" });
    if (typeof switchedChain !== "string" || !isPolygonAmoy(switchedChain)) {
      throw new Error("MetaMask belum beralih ke Polygon Amoy.");
    }
    currentChainHex = switchedChain;
  }

  // 3. Initialize ethers BrowserProvider & Signer
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner(account);
  const chainId = Number.parseInt(currentChainHex, 16);

  // 4. Read User Role and Whitelisted Actor Name from Smart Contract
  let role: UserRole | null = null;
  let actorName = "";
  let profileError: string | null = null;
  try {
    [role, actorName] = await Promise.all([
      getUserRole(account),
      getActorName(account),
    ]);
  } catch (error) {
    profileError =
      error instanceof Error
        ? error.message
        : "Gagal memuat peran akun dari Polygon Amoy.";
  }

  return {
    account,
    provider,
    signer,
    chainId,
    isCorrectNetwork: isPolygonAmoy(chainId),
    role,
    actorName,
    profileError,
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
  const ethereum = getInjectedProvider();
  if (!ethereum) {
    return () => {};
  }

  const { onAccountChanged, onChainChanged, onDisconnect } = callbacks;
  const accountListener = (...args: unknown[]) => {
    const accounts = args[0];
    if (Array.isArray(accounts)) {
      onAccountChanged?.(accounts.filter((account): account is string => typeof account === "string"));
    }
  };
  const chainListener = (...args: unknown[]) => {
    if (typeof args[0] === "string") onChainChanged?.(args[0]);
  };
  const disconnectListener = (...args: unknown[]) => onDisconnect?.(args[0]);

  if (onAccountChanged && ethereum.on) {
    ethereum.on("accountsChanged", accountListener);
  }
  if (onChainChanged && ethereum.on) {
    ethereum.on("chainChanged", chainListener);
  }
  if (onDisconnect && ethereum.on) {
    ethereum.on("disconnect", disconnectListener);
  }

  // Return unsubscribe cleanup function
  return () => {
    if (onAccountChanged) {
      ethereum.removeListener?.("accountsChanged", accountListener);
    }
    if (onChainChanged) {
      ethereum.removeListener?.("chainChanged", chainListener);
    }
    if (onDisconnect) {
      ethereum.removeListener?.("disconnect", disconnectListener);
    }
  };
}
