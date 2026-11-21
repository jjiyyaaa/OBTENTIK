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
  useState,
} from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import {
  isPolygonAmoy,
  POLYGON_AMOY_CHAIN,
} from "./chains";
import {
  connectMetaMask,
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

export interface ObtentikProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

export const ObtentikProvider: React.FC<ObtentikProviderProps> = ({
  children,
  autoConnect = true,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>("CONSUMER");
  const [actorName, setActorName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

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
    } catch (err: any) {
      console.warn("Could not fetch user metadata:", err);
      setRole("CONSUMER");
      setActorName("");
    }
  }, []);

  /**
   * Manually or automatically initiates connection with MetaMask
   */
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask tidak terdeteksi di browser ini.");
      return;
    }

    try {
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
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    setIsConnected(false);
    setRole("CONSUMER");
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

  // Setup MetaMask event listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const cleanup = setupMetaMaskListeners({
      onAccountChanged: async (accounts) => {
        if (!accounts || accounts.length === 0) {
          disconnect();
        } else {
          const newAccount = accounts[0];
          setAccount(newAccount);
          setIsConnected(true);
          const prov = new BrowserProvider(window.ethereum);
          setProvider(prov);
          const sig = await prov.getSigner(newAccount);
          setSigner(sig);
          await loadAccountMetadata(newAccount);
        }
      },
      onChainChanged: (newChainIdHex) => {
        const correct = isPolygonAmoy(newChainIdHex);
        setIsCorrectNetwork(correct);
        setChainId(parseInt(newChainIdHex, 16));
      },
      onDisconnect: () => {
        disconnect();
      },
    });

    // Check if wallet is already connected
    if (autoConnect && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then(async (accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            const currentAccount = accounts[0];
            const prov = new BrowserProvider(window.ethereum);
            const sig = await prov.getSigner(currentAccount);
            const net = await prov.getNetwork();
            const currentChain = Number(net.chainId);

            setAccount(currentAccount);
            setProvider(prov);
            setSigner(sig);
            setChainId(currentChain);
            setIsCorrectNetwork(isPolygonAmoy(currentChain));
            setIsConnected(true);
            await loadAccountMetadata(currentAccount);
          }
        })
        .catch(() => {
          // Silent fallback
        });
    }

    return cleanup;
  }, [autoConnect, disconnect, loadAccountMetadata]);

  // Authenticated Transaction Wrappers (Passing current signer)
  const handleRegisterManufacturer = useCallback(
    (acc: string, name: string) => registerManufacturer(acc, name, signer || undefined),
    [signer]
  );

  const handleRegisterDistributor = useCallback(
    (acc: string, name: string) => registerDistributor(acc, name, signer || undefined),
    [signer]
  );

  const handleRegisterPharmacy = useCallback(
    (acc: string, name: string) => registerPharmacy(acc, name, signer || undefined),
    [signer]
  );

  const handleRegisterBatch = useCallback(
    (input: RegisterBatchInput) => registerBatch(input, signer || undefined),
    [signer]
  );

  const handleAddCheckpoint = useCallback(
    (input: AddCheckpointInput) => addCheckpoint(input, signer || undefined),
    [signer]
  );

  const handleVerifyCheckpoint = useCallback(
    (input: AddCheckpointInput) => verifyCheckpoint(input, signer || undefined),
    [signer]
  );

  const handleSetBatchRecallStatus = useCallback(
    (input: SetBatchRecallInput) => setBatchRecallStatus(input, signer || undefined),
    [signer]
  );

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
