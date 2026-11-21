const fs = require("fs");
const path = require("path");

/**
 * Standalone script to export ABI and Contract Configuration for Frontend (Next.js)
 * Can be run anytime via: npm run export:frontend
 */
function exportFrontend() {
  console.log("Generating Frontend Artifacts & ABI for OBTENTIK...");

  const artifactsPath = path.join(
    __dirname,
    "../artifacts/contracts/ObtentikSupplyChain.sol/ObtentikSupplyChain.json"
  );

  if (!fs.existsSync(artifactsPath)) {
    console.error("❌ Artifact not found! Please run 'npm run compile' first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));

  // Check if there is an existing deployment
  let contractAddress = "0x0000000000000000000000000000000000000000";
  let chainId = 80002;
  let networkName = "polygonAmoy";

  const deploymentPath = path.join(__dirname, "../deployments/polygonAmoy.json");
  if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    contractAddress = deployment.contractAddress || contractAddress;
    chainId = deployment.chainId || chainId;
    networkName = deployment.network || networkName;
  }

  const exportDir = path.join(__dirname, "../frontend-exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const contractData = {
    contractAddress,
    network: networkName,
    chainId,
    explorerUrl: `https://amoy.polygonscan.com/address/${contractAddress}`,
    exportedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  // 1. JSON Export
  const jsonPath = path.join(exportDir, "ObtentikContractData.json");
  fs.writeFileSync(jsonPath, JSON.stringify(contractData, null, 2));

  // 2. TypeScript / Next.js export
  const tsConfig = `// Auto-generated configuration for OBTENTIK Frontend
export const OBTENTIK_CONTRACT_ADDRESS = "${contractAddress}" as const;
export const OBTENTIK_CHAIN_ID = ${chainId};
export const OBTENTIK_NETWORK_NAME = "${networkName}";
export const OBTENTIK_EXPLORER_URL = "https://amoy.polygonscan.com/address/${contractAddress}";

export const OBTENTIK_ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;

export default {
  address: OBTENTIK_CONTRACT_ADDRESS,
  chainId: OBTENTIK_CHAIN_ID,
  network: OBTENTIK_NETWORK_NAME,
  explorerUrl: OBTENTIK_EXPLORER_URL,
  abi: OBTENTIK_ABI,
};
`;

  const tsPath = path.join(exportDir, "ObtentikConfig.ts");
  fs.writeFileSync(tsPath, tsConfig);

  console.log("✅ Successfully exported to:");
  console.log(`   - ${jsonPath}`);
  console.log(`   - ${tsPath}`);
}

exportFrontend();
