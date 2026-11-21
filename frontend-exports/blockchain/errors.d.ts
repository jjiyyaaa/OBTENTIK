/**
 * OBTENTIK - Error Handling and ABI Error Decoder
 * Translates Solidity Custom Errors and Web3/MetaMask RPC errors into clear Indonesian messages.
 */
/**
 * Known custom errors in ObtentikSupplyChain.sol
 */
export declare const ERROR_MESSAGES_ID: Record<string, string>;
/**
 * Decodes error thrown by ethers.js or MetaMask
 */
export declare function decodeContractError(error: any): string;
