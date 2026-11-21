"use client";

/**
 * OBTENTIK - Next.js React Context & Provider
 * Manages reactive wallet connection, Polygon Amoy network verification,
 * user role state, and provides seamless methods for both read-only and write interactions.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import {
  isPolygonAmoy,
  POLYGON_AMOY_CHAIN,
} from "./chains";
import {
  connectMetaMask,
  getInjectedProvider,
  isMetaMaskInstalled,
  setupMetaMaskListeners,
  switchToPolygonAmoy,
} from "./metamask";
import {
  getAllBatches,
  getBatchCheckpoints,
  getBatchCount,
  getBatchDetail,
  getUserRole,
  getActorName,
  verifyBatch,
} from "./readonly";
import {
  addCheckpoint,
  registerBatch,
  registerDistributor,
  registerManufacturer,
  registerPharmacy,
  setBatchRecallStatus,
  verifyCheckpoint,
} from "./transactions";
import {
  AddCheckpointInput,
  BatchDetail,
  BatchVerificationResult,
  CheckpointData,
  RegisterBatchInput,
  SetBatchRecallInput,
  TransactionResult,
  UserRole,
  WalletState,
} from "./types";

export interface ObtentikContextValue extends WalletState {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToAmoy: () => Promise<boolean>;
  refreshRole: () => Promise<void>;

  // Public Read-Only methods (No wallet needed)
  verifyBatch: (batchId: string) => Promise<BatchVerificationResult>;
  getBatchDetail: (batchId: string) => Promise<BatchDetail>;
  getBatchCheckpoints: (batchId: string) => Promise<CheckpointData[]>;
  getAllBatches: () => Promise<string[]>;
  getBatchCount: () => Promise<number>;

  // Authenticated Transaction methods (MetaMask signing)
  registerManufacturer: (account: string, name: string) => Promise<TransactionResult>;
  registerDistributor: (account: string, name: string) => Promise<TransactionResult>;
  registerPharmacy: (account: string, name: string) => Promise<TransactionResult>;
  registerBatch: (input: RegisterBatchInput) => Promise<TransactionResult>;
  addCheckpoint: (input: AddCheckpointInput) => Promise<TransactionResult>;
  verifyCheckpoint: (input: AddCheckpointInput) => Promise<TransactionResult>;
  setBatchRecallStatus: (input: SetBatchRecallInput) => Promise<TransactionResult>;
}

const ObtentikContext = createContext<ObtentikContextValue | null>(null);
const AUTO_CONNECT_DISABLED_KEY = "obtentik-wallet-autoconnect-disabled";

export interface ObtentikProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

export const ObtentikProvider: React.FC<ObtentikProviderProps> = ({
  children,
  autoConnect = false,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [actorName, setActorName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const autoConnectTaskRef = useRef<Promise<void> | null>(null);

  /**
   * Updates user role and corporate name for a specific account
   */
  const loadAccountMetadata = useCallback(async (targetAccount: string) => {
    try {
      const [detectedRole, detectedName] = await Promise.all([
        getUserRole(targetAccount),
        getActorName(targetAccount),
      ]);
      setRole(detectedRole);
      setActorName(detectedName);
      setError(null);
    } catch (err: any) {
      console.warn("Could not fetch user metadata:", err);
      setRole(null);
      setActorName("");
      setError(err.message || "Gagal memuat peran akun dari Polygon Amoy.");
    }
  }, []);

  /**
   * Initiates a user-requested connection with MetaMask
   */
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask tidak terdeteksi di browser ini.");
      return;
    }

    try {
      window.sessionStorage.removeItem(AUTO_CONNECT_DISABLED_KEY);
      if (!autoConnectTaskRef.current) {
        autoConnectTaskRef.current = Promise.resolve();
      }
      setIsConnecting(true);
      setError(null);

      const conn = await connectMetaMask();
      setAccount(conn.account);
      setProvider(conn.provider);
      setSigner(conn.signer);
      setChainId(conn.chainId);
      setIsCorrectNetwork(conn.isCorrectNetwork);
      setRole(conn.role);
      setActorName(conn.actorName);
      setError(conn.profileError);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || "Gagal menghubungkan ke MetaMask.");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Resets wallet connection state
   */
  const disconnect = useCallback(() => {
    window.sessionStorage.setItem(AUTO_CONNECT_DISABLED_KEY, "true");
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    setIsConnected(false);
    setRole(null);
    setActorName("");
    setError(null);
  }, []);

  /**
   * Triggers switch or add chain to Polygon Amoy Testnet
   */
  const switchToAmoy = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const switched = await switchToPolygonAmoy();
      if (switched) {
        setIsCorrectNetwork(true);
        setChainId(POLYGON_AMOY_CHAIN.chainId);
      } else {
        setIsCorrectNetwork(false);
        setError("MetaMask belum beralih ke Polygon Amoy.");
      }
      return switched;
    } catch (err: any) {
      setError(err.message || "Gagal beralih ke jaringan Polygon Amoy.");
      return false;
    }
  }, []);

  /**
   * Refreshes the user role and actor name from contract
   */
  const refreshRole = useCallback(async () => {
    if (account) {
      await loadAccountMetadata(account);
    }
  }, [account, loadAccountMetadata]);

  const assertAuthorizedRole = useCallback(
    (allowedRoles: readonly UserRole[]) => {
      if (!isConnected || !account || !signer) {
        throw new Error("Hubungkan dompet MetaMask sebelum melakukan transaksi.");
      }
      if (!isCorrectNetwork) {
        throw new Error("Transaksi hanya dapat ditandatangani di Polygon Amoy.");
      }
      if (!role || !allowedRoles.includes(role)) {
        throw new Error(`Peran ${role ?? "belum tersedia"} tidak memiliki izin untuk tindakan ini.`);
      }
    },
    [account, isConnected, isCorrectNetwork, role, signer]
  );

  // Setup MetaMask event listeners
  useEffect(() => {
    const ethereum = getInjectedProvider();
    if (!ethereum) return;

    const cleanup = setupMetaMaskListeners({
      onAccountChanged: async (accounts) => {
        if (!isConnected) return;

        if (!accounts || accounts.length === 0) {
          disconnect();
        } else {
          const newAccount = accounts[0];
          setAccount(newAccount);
          setIsConnected(true);
          setRole(null);
          setActorName("");
          try {
            const prov = new BrowserProvider(ethereum);
            const sig = await prov.getSigner(newAccount);
            setProvider(prov);
            setSigner(sig);
            await loadAccountMetadata(newAccount);
          } catch (err: any) {
            setError(err.message || "Gagal memuat akun MetaMask yang dipilih.");
          }
        }
      },
      onChainChanged: async (newChainIdHex) => {
        const correct = isPolygonAmoy(newChainIdHex);
        setIsCorrectNetwork(correct);
        setChainId(parseInt(newChainIdHex, 16));
        if (correct && account) {
          await loadAccountMetadata(account);
        } else if (!correct) {
          setRole(null);
          setActorName("");
        }
      },
      onDisconnect: () => {
        disconnect();
      },
    });

    // Check if wallet is already connected
    const autoConnectDisabled =
      window.sessionStorage.getItem(AUTO_CONNECT_DISABLED_KEY) === "true";
    if (autoConnect && !autoConnectDisabled && !autoConnectTaskRef.current) {
      autoConnectTaskRef.current = (async () => {
        const result = await ethereum.request({ method: "eth_accounts" });
        const accounts = Array.isArray(result)
          ? result.filter((item): item is string => typeof item === "string")
          : [];
        if (accounts.length === 0) return;

        const currentAccount = accounts[0];
        const prov = new BrowserProvider(ethereum);
        const [sig, net] = await Promise.all([
          prov.getSigner(currentAccount),
          prov.getNetwork(),
        ]);
        const currentChain = Number(net.chainId);

        setAccount(currentAccount);
        setProvider(prov);
        setSigner(sig);
        setChainId(currentChain);
        setIsCorrectNetwork(isPolygonAmoy(currentChain));
        setIsConnected(true);
        setError(null);
        await loadAccountMetadata(currentAccount);
      })().catch((err: unknown) => {
        console.warn("Could not restore MetaMask connection:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memulihkan koneksi MetaMask."
        );
      });
    }

    return cleanup;
  }, [account, autoConnect, disconnect, isConnected, loadAccountMetadata]);

  // Authenticated Transaction Wrappers (Passing current signer)
  const handleRegisterManufacturer = useCallback((acc: string, name: string) => {
    assertAuthorizedRole(["ADMIN"]);
    return registerManufacturer(acc, name, signer || undefined);
  }, [assertAuthorizedRole, signer]);

  const handleRegisterDistributor = useCallback((acc: string, name: string) => {
    assertAuthorizedRole(["ADMIN"]);
    return registerDistributor(acc, name, signer || undefined);
  }, [assertAuthorizedRole, signer]);

  const handleRegisterPharmacy = useCallback((acc: string, name: string) => {
    assertAuthorizedRole(["ADMIN"]);
    return registerPharmacy(acc, name, signer || undefined);
  }, [assertAuthorizedRole, signer]);

  const handleRegisterBatch = useCallback((input: RegisterBatchInput) => {
    assertAuthorizedRole(["ADMIN", "MANUFACTURER"]);
    return registerBatch(input, signer || undefined);
  }, [assertAuthorizedRole, signer]);

  const handleAddCheckpoint = useCallback((input: AddCheckpointInput) => {
    assertAuthorizedRole(["DISTRIBUTOR", "PHARMACY"]);
    return addCheckpoint(input, signer || undefined);
  }, [assertAuthorizedRole, signer]);

  const handleVerifyCheckpoint = useCallback((input: AddCheckpointInput) => {
    assertAuthorizedRole(["DISTRIBUTOR", "PHARMACY"]);
    return verifyCheckpoint(input, signer || undefined);
  }, [assertAuthorizedRole, signer]);

  const handleSetBatchRecallStatus = useCallback((input: SetBatchRecallInput) => {
    assertAuthorizedRole(["ADMIN", "MANUFACTURER"]);
    return setBatchRecallStatus(input, signer || undefined);
  }, [assertAuthorizedRole, signer]);

  const value: ObtentikContextValue = {
    account,
    chainId,
    isCorrectNetwork,
    isConnected,
    isConnecting,
    role,
    actorName,
    error,
    provider,
    signer,
    connect,
    disconnect,
    switchToAmoy,
    refreshRole,
    // Read-only
    verifyBatch,
    getBatchDetail,
    getBatchCheckpoints,
    getAllBatches,
    getBatchCount,
    // Transactions
    registerManufacturer: handleRegisterManufacturer,
    registerDistributor: handleRegisterDistributor,
    registerPharmacy: handleRegisterPharmacy,
    registerBatch: handleRegisterBatch,
    addCheckpoint: handleAddCheckpoint,
    verifyCheckpoint: handleVerifyCheckpoint,
    setBatchRecallStatus: handleSetBatchRecallStatus,
  };

  return <ObtentikContext.Provider value={value}>{children}</ObtentikContext.Provider>;
};

/**
 * Hook to consume ObtentikContext
 */
export function useObtentikContext(): ObtentikContextValue {
  const context = useContext(ObtentikContext);
  if (!context) {
    throw new Error("useObtentikContext must be used within an <ObtentikProvider>");
  }
  return context;
}
