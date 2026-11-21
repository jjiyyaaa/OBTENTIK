"use strict";
/**
 * OBTENTIK - MetaMask Connector & Network Management
 * Handles wallet connection, auto switch/add chain to Polygon Amoy (80002 / 0x13882),
 * and listener registration for account and chain updates.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMetaMaskInstalled = isMetaMaskInstalled;
exports.getBrowserProvider = getBrowserProvider;
exports.switchToPolygonAmoy = switchToPolygonAmoy;
exports.connectMetaMask = connectMetaMask;
exports.setupMetaMaskListeners = setupMetaMaskListeners;
const ethers_1 = require("ethers");
const chains_1 = require("./chains");
const errors_1 = require("./errors");
const readonly_1 = require("./readonly");
/**
 * Checks if MetaMask / an Ethereum provider is installed in the browser
 */
function isMetaMaskInstalled() {
    return typeof window !== "undefined" && Boolean(window.ethereum);
}
/**
 * Gets a BrowserProvider from window.ethereum
 */
function getBrowserProvider() {
    if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask tidak terdeteksi. Silakan pasang ekstensi MetaMask di browser Anda.");
    }
    return new ethers_1.BrowserProvider(window.ethereum);
}
/**
 * Automatically switches or adds the Polygon Amoy Testnet (Chain ID 80002 / 0x13882) in MetaMask
 */
async function switchToPolygonAmoy() {
    if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask tidak terdeteksi.");
    }
    try {
        // 1. Try to switch to Polygon Amoy
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chains_1.POLYGON_AMOY_CHAIN.chainIdHex }],
        });
        return true;
    }
    catch (switchError) {
        // Error code 4902 indicates that the chain has not been added to MetaMask yet
        if (switchError.code === 4902 ||
            switchError.message?.includes("wallet_addEthereumChain") ||
            switchError.message?.includes("Unrecognized chain ID")) {
            try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: chains_1.POLYGON_AMOY_CHAIN.chainIdHex,
                            chainName: chains_1.POLYGON_AMOY_CHAIN.chainName,
                            nativeCurrency: chains_1.POLYGON_AMOY_CHAIN.nativeCurrency,
                            rpcUrls: [...chains_1.POLYGON_AMOY_CHAIN.rpcUrls],
                            blockExplorerUrls: [...chains_1.POLYGON_AMOY_CHAIN.blockExplorerUrls],
                        },
                    ],
                });
                return true;
            }
            catch (addError) {
                throw new Error(`Gagal menambahkan jaringan Polygon Amoy ke MetaMask: ${(0, errors_1.decodeContractError)(addError)}`);
            }
        }
        // User rejected chain switch request
        if (switchError.code === 4001) {
            throw new Error("Permintaan pindah jaringan ke Polygon Amoy ditolak oleh pengguna.");
        }
        throw new Error(`Gagal berpindah jaringan ke Polygon Amoy: ${(0, errors_1.decodeContractError)(switchError)}`);
    }
}
/**
 * Connects to MetaMask, switches to Polygon Amoy, and retrieves user profile (role + name)
 */
async function connectMetaMask() {
    if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask tidak terdeteksi di browser ini. Mohon gunakan browser dengan ekstensi MetaMask.");
    }
    // 1. Request account access
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });
    if (!accounts || accounts.length === 0) {
        throw new Error("Tidak ada akun yang dipilih di MetaMask.");
    }
    const account = accounts[0];
    // 2. Check and ensure chain is Polygon Amoy
    const currentChainHex = await window.ethereum.request({
        method: "eth_chainId",
    });
    let isCorrect = (0, chains_1.isPolygonAmoy)(currentChainHex);
    if (!isCorrect) {
        await switchToPolygonAmoy();
        isCorrect = true;
    }
    // 3. Initialize ethers BrowserProvider & Signer
    const provider = new ethers_1.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(account);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    // 4. Read User Role and Whitelisted Actor Name from Smart Contract
    const [role, actorName] = await Promise.all([
        (0, readonly_1.getUserRole)(account),
        (0, readonly_1.getActorName)(account),
    ]);
    return {
        account,
        provider,
        signer,
        chainId,
        isCorrectNetwork: (0, chains_1.isPolygonAmoy)(chainId),
        role,
        actorName,
    };
}
/**
 * Subscribes to MetaMask events (account changes, chain changes, disconnect)
 */
function setupMetaMaskListeners(callbacks) {
    if (!isMetaMaskInstalled()) {
        return () => { };
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
        if (!isMetaMaskInstalled())
            return;
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
