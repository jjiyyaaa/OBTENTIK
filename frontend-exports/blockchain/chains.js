/**
 * OBTENTIK - Network Configuration for Polygon Amoy Testnet (ESM)
 */
export const POLYGON_AMOY_CHAIN = {
  chainId: 80002,
  chainIdHex: "0x13882",
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: [
    "https://rpc-amoy.polygon.technology/",
    "https://polygon-amoy-bor-rpc.publicnode.com",
    "https://amoy.drpc.org",
  ],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
  faucetUrls: [
    "https://faucet.polygon.technology/",
    "https://faucets.chain.link/polygon-amoy",
  ],
};

export const DEFAULT_OBTENTIK_ADDRESS = "0x511251E3b80e72d437E479B6D6039992Db813049";

export function getContractAddress() {
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

export function getPublicRpcUrl(index = 0) {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_POLYGON_AMOY_RPC) {
    return process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC;
  }
  return POLYGON_AMOY_CHAIN.rpcUrls[index % POLYGON_AMOY_CHAIN.rpcUrls.length];
}

export function getExplorerTxUrl(txHash) {
  return `${POLYGON_AMOY_CHAIN.blockExplorerUrls[0]}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address) {
  return `${POLYGON_AMOY_CHAIN.blockExplorerUrls[0]}/address/${address}`;
}

export function isPolygonAmoy(chainId) {
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
