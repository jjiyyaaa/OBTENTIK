const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=============================================================");
  console.log("  OBTENTIK Smart Contract Deployment to Polygon Amoy Testnet");
  console.log("  Built for HackSphere 2026 - Team imouttt (President Univ)");
  console.log("=============================================================\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log(`📡 Network Name : ${hre.network.name}`);
  console.log(`🔗 Chain ID     : ${network.chainId.toString()}`);
  console.log(`👤 Deployer     : ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance      : ${hre.ethers.formatEther(balance)} POL\n`);

  if (balance === 0n && hre.network.name === "polygonAmoy") {
    console.warn("⚠️ Warning: Deployer balance is 0 POL. Please request testnet POL from Polygon Faucet:");
    console.warn("👉 https://faucet.polygon.technology/ or https://faucets.chain.link/polygon-amoy\n");
  }

  console.log("🚀 Deploying ObtentikSupplyChain contract...");
  const ObtentikFactory = await hre.ethers.getContractFactory("ObtentikSupplyChain");
  const obtentik = await ObtentikFactory.deploy(deployer.address);

  await obtentik.waitForDeployment();
  const contractAddress = await obtentik.getAddress();
  const txHash = obtentik.deploymentTransaction().hash;

  console.log("\n✅ Contract deployed successfully!");
  console.log(`📍 Contract Address : ${contractAddress}`);
  console.log(`📜 Tx Hash          : ${txHash}`);
  console.log(`🔍 Amoy Explorer    : https://amoy.polygonscan.com/address/${contractAddress}`);

  // Optional: Auto-whitelist initial actors if environment variables are provided
  if (process.env.INITIAL_MANUFACTURER_ADDRESS) {
    const mfgName = process.env.INITIAL_MANUFACTURER_NAME || "PT Kimia Farma Tbk";
    console.log(`\n⚙️ Whitelisting initial Manufacturer: ${process.env.INITIAL_MANUFACTURER_ADDRESS} (${mfgName})...`);
    const tx = await obtentik.registerManufacturer(process.env.INITIAL_MANUFACTURER_ADDRESS, mfgName);
    await tx.wait();
    console.log("   ✓ Manufacturer registered.");
  }

  if (process.env.INITIAL_DISTRIBUTOR_ADDRESS) {
    const distName = process.env.INITIAL_DISTRIBUTOR_NAME || "PT Kimia Farma Trading & Distribution";
    console.log(`⚙️ Whitelisting initial Distributor: ${process.env.INITIAL_DISTRIBUTOR_ADDRESS} (${distName})...`);
    const tx = await obtentik.registerDistributor(process.env.INITIAL_DISTRIBUTOR_ADDRESS, distName);
    await tx.wait();
    console.log("   ✓ Distributor registered.");
  }

  if (process.env.INITIAL_PHARMACY_ADDRESS) {
    const pharmName = process.env.INITIAL_PHARMACY_NAME || "Apotek K-24 Senopati";
    console.log(`⚙️ Whitelisting initial Pharmacy: ${process.env.INITIAL_PHARMACY_ADDRESS} (${pharmName})...`);
    const tx = await obtentik.registerPharmacy(process.env.INITIAL_PHARMACY_ADDRESS, pharmName);
    await tx.wait();
    console.log("   ✓ Pharmacy registered.");
  }

  // Export contract artifacts for Frontend (Next.js)
  const artifactsPath = path.join(__dirname, "../artifacts/contracts/ObtentikSupplyChain.sol/ObtentikSupplyChain.json");
  const artifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));

  const exportDir = path.join(__dirname, "../frontend-exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const contractData = {
    contractAddress,
    network: hre.network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    transactionHash: txHash,
    explorerUrl: `https://amoy.polygonscan.com/address/${contractAddress}`,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi
  };

  // 1. JSON export for universal frontend import
  const jsonPath = path.join(exportDir, "ObtentikContractData.json");
  fs.writeFileSync(jsonPath, JSON.stringify(contractData, null, 2));

  // 2. TypeScript / Next.js ready configuration
  const tsConfig = `// Auto-generated configuration for OBTENTIK Frontend
export const OBTENTIK_CONTRACT_ADDRESS = "${contractAddress}" as const;
export const OBTENTIK_CHAIN_ID = ${network.chainId.toString()};
export const OBTENTIK_NETWORK_NAME = "${hre.network.name}";
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

  // 3. Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(contractData, null, 2)
  );

  console.log("\n📦 Frontend files successfully generated:");
  console.log(`   📁 JSON Export       : ${jsonPath}`);
  console.log(`   📁 TypeScript Export : ${tsPath}`);
  console.log(`   📁 Deployment Record : ${path.join(deploymentsDir, `${hre.network.name}.json`)}`);
  console.log("\n✨ Deployment and export complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
