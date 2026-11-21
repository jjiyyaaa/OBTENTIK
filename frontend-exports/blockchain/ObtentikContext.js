"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObtentikProvider = void 0;
exports.useObtentikContext = useObtentikContext;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * OBTENTIK - Next.js React Context & Provider
 * Manages reactive wallet connection, Polygon Amoy network verification,
 * user role state, and provides seamless methods for both read-only and write interactions.
 */
const react_1 = __importStar(require("react"));
const ethers_1 = require("ethers");
const chains_1 = require("./chains");
const metamask_1 = require("./metamask");
const readonly_1 = require("./readonly");
const transactions_1 = require("./transactions");
const ObtentikContext = (0, react_1.createContext)(null);
const ObtentikProvider = ({ children, autoConnect = true, }) => {
    const [account, setAccount] = (0, react_1.useState)(null);
    const [chainId, setChainId] = (0, react_1.useState)(null);
    const [isCorrectNetwork, setIsCorrectNetwork] = (0, react_1.useState)(false);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [isConnecting, setIsConnecting] = (0, react_1.useState)(false);
    const [role, setRole] = (0, react_1.useState)("CONSUMER");
    const [actorName, setActorName] = (0, react_1.useState)("");
    const [error, setError] = (0, react_1.useState)(null);
    const [provider, setProvider] = (0, react_1.useState)(null);
    const [signer, setSigner] = (0, react_1.useState)(null);
    /**
     * Updates user role and corporate name for a specific account
     */
    const loadAccountMetadata = (0, react_1.useCallback)(async (targetAccount) => {
        try {
            const [detectedRole, detectedName] = await Promise.all([
                (0, readonly_1.getUserRole)(targetAccount),
                (0, readonly_1.getActorName)(targetAccount),
            ]);
            setRole(detectedRole);
            setActorName(detectedName);
        }
        catch (err) {
            console.warn("Could not fetch user metadata:", err);
            setRole("CONSUMER");
            setActorName("");
        }
    }, []);
    /**
     * Manually or automatically initiates connection with MetaMask
     */
    const connect = (0, react_1.useCallback)(async () => {
        if (!(0, metamask_1.isMetaMaskInstalled)()) {
            setError("MetaMask tidak terdeteksi di browser ini.");
            return;
        }
        try {
            setIsConnecting(true);
            setError(null);
            const conn = await (0, metamask_1.connectMetaMask)();
            setAccount(conn.account);
            setProvider(conn.provider);
            setSigner(conn.signer);
            setChainId(conn.chainId);
            setIsCorrectNetwork(conn.isCorrectNetwork);
            setRole(conn.role);
            setActorName(conn.actorName);
            setIsConnected(true);
        }
        catch (err) {
            setError(err.message || "Gagal menghubungkan ke MetaMask.");
            setIsConnected(false);
        }
        finally {
            setIsConnecting(false);
        }
    }, []);
    /**
     * Resets wallet connection state
     */
    const disconnect = (0, react_1.useCallback)(() => {
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
    const switchToAmoy = (0, react_1.useCallback)(async () => {
        try {
            setError(null);
            const switched = await (0, metamask_1.switchToPolygonAmoy)();
            if (switched) {
                setIsCorrectNetwork(true);
                setChainId(chains_1.POLYGON_AMOY_CHAIN.chainId);
            }
            return switched;
        }
        catch (err) {
            setError(err.message || "Gagal beralih ke jaringan Polygon Amoy.");
            return false;
        }
    }, []);
    /**
     * Refreshes the user role and actor name from contract
     */
    const refreshRole = (0, react_1.useCallback)(async () => {
        if (account) {
            await loadAccountMetadata(account);
        }
    }, [account, loadAccountMetadata]);
    // Setup MetaMask event listeners
    (0, react_1.useEffect)(() => {
        if (!(0, metamask_1.isMetaMaskInstalled)())
            return;
        const cleanup = (0, metamask_1.setupMetaMaskListeners)({
            onAccountChanged: async (accounts) => {
                if (!accounts || accounts.length === 0) {
                    disconnect();
                }
                else {
                    const newAccount = accounts[0];
                    setAccount(newAccount);
                    setIsConnected(true);
                    const prov = new ethers_1.BrowserProvider(window.ethereum);
                    setProvider(prov);
                    const sig = await prov.getSigner(newAccount);
                    setSigner(sig);
                    await loadAccountMetadata(newAccount);
                }
            },
            onChainChanged: (newChainIdHex) => {
                const correct = (0, chains_1.isPolygonAmoy)(newChainIdHex);
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
                .then(async (accounts) => {
                if (accounts && accounts.length > 0) {
                    const currentAccount = accounts[0];
                    const prov = new ethers_1.BrowserProvider(window.ethereum);
                    const sig = await prov.getSigner(currentAccount);
                    const net = await prov.getNetwork();
                    const currentChain = Number(net.chainId);
                    setAccount(currentAccount);
                    setProvider(prov);
                    setSigner(sig);
                    setChainId(currentChain);
                    setIsCorrectNetwork((0, chains_1.isPolygonAmoy)(currentChain));
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
    const handleRegisterManufacturer = (0, react_1.useCallback)((acc, name) => (0, transactions_1.registerManufacturer)(acc, name, signer || undefined), [signer]);
    const handleRegisterDistributor = (0, react_1.useCallback)((acc, name) => (0, transactions_1.registerDistributor)(acc, name, signer || undefined), [signer]);
    const handleRegisterPharmacy = (0, react_1.useCallback)((acc, name) => (0, transactions_1.registerPharmacy)(acc, name, signer || undefined), [signer]);
    const handleRegisterBatch = (0, react_1.useCallback)((input) => (0, transactions_1.registerBatch)(input, signer || undefined), [signer]);
    const handleAddCheckpoint = (0, react_1.useCallback)((input) => (0, transactions_1.addCheckpoint)(input, signer || undefined), [signer]);
    const handleVerifyCheckpoint = (0, react_1.useCallback)((input) => (0, transactions_1.verifyCheckpoint)(input, signer || undefined), [signer]);
    const handleSetBatchRecallStatus = (0, react_1.useCallback)((input) => (0, transactions_1.setBatchRecallStatus)(input, signer || undefined), [signer]);
    const value = {
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
        verifyBatch: readonly_1.verifyBatch,
        getBatchDetail: readonly_1.getBatchDetail,
        getBatchCheckpoints: readonly_1.getBatchCheckpoints,
        getAllBatches: readonly_1.getAllBatches,
        getBatchCount: readonly_1.getBatchCount,
        // Transactions
        registerManufacturer: handleRegisterManufacturer,
        registerDistributor: handleRegisterDistributor,
        registerPharmacy: handleRegisterPharmacy,
        registerBatch: handleRegisterBatch,
        addCheckpoint: handleAddCheckpoint,
        verifyCheckpoint: handleVerifyCheckpoint,
        setBatchRecallStatus: handleSetBatchRecallStatus,
    };
    return (0, jsx_runtime_1.jsx)(ObtentikContext.Provider, { value: value, children: children });
};
exports.ObtentikProvider = ObtentikProvider;
/**
 * Hook to consume ObtentikContext
 */
function useObtentikContext() {
    const context = (0, react_1.useContext)(ObtentikContext);
    if (!context) {
        throw new Error("useObtentikContext must be used within an <ObtentikProvider>");
    }
    return context;
}
