const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OBTENTIK Next.js Blockchain Connection Module", function () {
  let supplyChain;
  let admin, manufacturer, distributor, pharmacy, consumer;

  before(async function () {
    [admin, manufacturer, distributor, pharmacy, consumer] = await ethers.getSigners();

    const ObtentikSupplyChain = await ethers.getContractFactory("ObtentikSupplyChain");
    supplyChain = await ObtentikSupplyChain.deploy(admin.address);
    await supplyChain.waitForDeployment();

    // Whitelist actors
    await supplyChain.connect(admin).registerManufacturer(manufacturer.address, "PT Kimia Farma Tbk");
    await supplyChain.connect(admin).registerDistributor(distributor.address, "PT Kimia Farma Trading & Distribution");
    await supplyChain.connect(admin).registerPharmacy(pharmacy.address, "Apotek K-24 Senopati");
  });

  describe("1. Polygon Amoy Network & Chain Specification", function () {
    it("Should define Polygon Amoy Testnet chain specs correctly", function () {
      const { POLYGON_AMOY_CHAIN, isPolygonAmoy } = require("../frontend-exports/blockchain/chains");

      expect(POLYGON_AMOY_CHAIN.chainId).to.equal(80002);
      expect(POLYGON_AMOY_CHAIN.chainIdHex).to.equal("0x13882");
      expect(POLYGON_AMOY_CHAIN.nativeCurrency.symbol).to.equal("POL");
      expect(POLYGON_AMOY_CHAIN.nativeCurrency.decimals).to.equal(18);
      expect(POLYGON_AMOY_CHAIN.rpcUrls.length).to.be.greaterThan(0);
      expect(POLYGON_AMOY_CHAIN.blockExplorerUrls[0]).to.include("amoy.polygonscan.com");

      // Test chain validator
      expect(isPolygonAmoy(80002)).to.be.true;
      expect(isPolygonAmoy("80002")).to.be.true;
      expect(isPolygonAmoy("0x13882")).to.be.true;
      expect(isPolygonAmoy("0X13882")).to.be.true;
      expect(isPolygonAmoy(1)).to.be.false;
      expect(isPolygonAmoy(137)).to.be.false;
    });

    it("Should construct correct block explorer links", function () {
      const { getExplorerTxUrl, getExplorerAddressUrl } = require("../frontend-exports/blockchain/chains");
      const sampleTx = "0xfa2402816dd31388a31a8512f630aa4b117288309a5489c59e3546d2155f3c28";
      const sampleAddr = "0x511251E3b80e72d437E479B6D6039992Db813049";

      expect(getExplorerTxUrl(sampleTx)).to.equal(`https://amoy.polygonscan.com/tx/${sampleTx}`);
      expect(getExplorerAddressUrl(sampleAddr)).to.equal(`https://amoy.polygonscan.com/address/${sampleAddr}`);
    });
  });

  describe("2. Error Decoder & Friendly Explanations", function () {
    it("Should decode Solidity custom errors accurately", function () {
      const { decodeContractError } = require("../frontend-exports/blockchain/errors");

      expect(decodeContractError(new Error("BatchNotFound"))).to.include("tidak ditemukan");
      expect(decodeContractError(new Error("BatchAlreadyExists"))).to.include("sudah terdaftar");
      expect(decodeContractError(new Error("BatchAlreadyRecalled"))).to.include("ditarik dari peredaran");
      expect(decodeContractError(new Error("InvalidDates"))).to.include("lebih lama dari tanggal produksi");
      expect(decodeContractError(new Error("InvalidSupplyChainSequence"))).to.include("urutan rantai pasok");
      expect(decodeContractError(new Error("UnauthorizedActor"))).to.include("tidak memiliki wewenang");
    });

    it("Should decode MetaMask user rejection and insufficient funds", function () {
      const { decodeContractError } = require("../frontend-exports/blockchain/errors");

      expect(decodeContractError({ code: 4001 })).to.include("dibatalkan oleh pengguna");
      expect(decodeContractError({ code: "ACTION_REJECTED" })).to.include("dibatalkan oleh pengguna");
      expect(decodeContractError({ code: "INSUFFICIENT_FUNDS" })).to.include("Saldo token POL/MATIC");
    });
  });

  describe("3. Role Detection & Actor Names Resolution", function () {
    it("Should resolve roles via getUserRole on contract directly", async function () {
      expect(await supplyChain.getUserRole(admin.address)).to.equal("ADMIN");
      expect(await supplyChain.getUserRole(manufacturer.address)).to.equal("MANUFACTURER");
      expect(await supplyChain.getUserRole(distributor.address)).to.equal("DISTRIBUTOR");
      expect(await supplyChain.getUserRole(pharmacy.address)).to.equal("PHARMACY");
      expect(await supplyChain.getUserRole(consumer.address)).to.equal("CONSUMER");
    });

    it("Should resolve registered actor official corporate names", async function () {
      expect(await supplyChain.actorNames(manufacturer.address)).to.equal("PT Kimia Farma Tbk");
      expect(await supplyChain.actorNames(distributor.address)).to.equal("PT Kimia Farma Trading & Distribution");
      expect(await supplyChain.actorNames(pharmacy.address)).to.equal("Apotek K-24 Senopati");
      expect(await supplyChain.actorNames(consumer.address)).to.equal("");
    });
  });

  describe("4. Read-Only Batch Query & Verification", function () {
    const batchId = "TEST-BATCH-READONLY-01";

    before(async function () {
      const latestBlock = await ethers.provider.getBlock("latest");
      const prodDate = latestBlock.timestamp - 100;
      const expDate = latestBlock.timestamp + 86400 * 365;

      await supplyChain.connect(manufacturer).registerBatch(
        batchId,
        "Amoxicillin 500mg",
        "DKL9988776655A1",
        "LOT-TEST-99",
        prodDate,
        expDate,
        "Pabrik Kimia Farma Cikarang",
        "Passed QC inspection"
      );
    });

    it("verifyBatch returns authentic status without wallet", async function () {
      const result = await supplyChain.verifyBatch(batchId);
      expect(result[0]).to.be.true; // isValid
      expect(result[1]).to.be.true; // isAuthentic
      expect(result[2]).to.be.false; // isRecalled
      expect(result[3]).to.be.false; // isExpired
      expect(Number(result[4])).to.equal(0); // Manufactured
      expect(result[5]).to.include("AUTHENTIC");
      expect(Number(result[6])).to.equal(1); // checkpointCount
    });

    it("getBatchDetail returns full metadata", async function () {
      const detail = await supplyChain.getBatchDetail(batchId);
      expect(detail[0]).to.equal(batchId);
      expect(detail[1]).to.equal("Amoxicillin 500mg");
      expect(detail[2]).to.equal("DKL9988776655A1");
      expect(detail[3]).to.equal("LOT-TEST-99");
      expect(detail[6]).to.equal(manufacturer.address);
      expect(Number(detail[7])).to.equal(0); // Manufactured
      expect(detail[8]).to.be.false; // isRecalled
      expect(Number(detail[10])).to.equal(1); // checkpointCount
    });

    it("getBatchCheckpoints returns chronological checkpoints", async function () {
      const cps = await supplyChain.getBatchCheckpoints(batchId);
      expect(cps.length).to.equal(1);
      expect(cps[0].actorRole).to.equal("MANUFACTURER");
      expect(cps[0].actorName).to.equal("PT Kimia Farma Tbk");
      expect(cps[0].location).to.equal("Pabrik Kimia Farma Cikarang");
    });
  });

  describe("5. End-to-End Real Transaction Signing Workflow", function () {
    const batchId = "TEST-BATCH-E2E-02";

    it("Should execute registerBatch as Manufacturer", async function () {
      const latestBlock = await ethers.provider.getBlock("latest");
      const prodDate = latestBlock.timestamp - 50;
      const expDate = latestBlock.timestamp + 86400 * 365;

      const tx = await supplyChain.connect(manufacturer).registerBatch(
        batchId,
        "Paracetamol 500mg",
        "DKL1122334455A1",
        "LOT-E2E-02",
        prodDate,
        expDate,
        "Pabrik Banjaran",
        "Initial manufacturing completed"
      );
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });

    it("Should execute addCheckpoint as Distributor (transitions to Distributed)", async function () {
      const tx = await supplyChain.connect(distributor).addCheckpoint(
        batchId,
        "PBF Warehouse Pulogadung",
        "Received and verified cold storage"
      );
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      const detail = await supplyChain.getBatchDetail(batchId);
      expect(Number(detail[7])).to.equal(1); // Distributed
      expect(Number(detail[10])).to.equal(2); // 2 checkpoints
    });

    it("Should execute verifyCheckpoint as Pharmacy (transitions to AtPharmacy)", async function () {
      const tx = await supplyChain.connect(pharmacy).verifyCheckpoint(
        batchId,
        "Apotek K-24 Senopati Jakarta",
        "Inspected by Licensed Pharmacist, stocked on shelf"
      );
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      const detail = await supplyChain.getBatchDetail(batchId);
      expect(Number(detail[7])).to.equal(2); // AtPharmacy
      expect(Number(detail[10])).to.equal(3); // 3 checkpoints
    });

    it("Should execute setBatchRecallStatus as Manufacturer or Admin", async function () {
      const tx = await supplyChain.connect(manufacturer).setBatchRecallStatus(
        batchId,
        true,
        "Peringatan BPOM: Cacat segel kemasan sekunder"
      );
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      const ver = await supplyChain.verifyBatch(batchId);
      expect(ver[1]).to.be.false; // isAuthentic is false when recalled
      expect(ver[2]).to.be.true;  // isRecalled is true
      expect(ver[5]).to.include("RECALLED");
    });
  });
});
