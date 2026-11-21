const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ObtentikSupplyChain Contract", function () {
  let obtentik;
  let admin, manufacturer, distributor, pharmacy, consumer, intruder;

  const BATCH_ID = "OBT-2026-PARA500-001";
  const PRODUCT_NAME = "Paracetamol 500mg Tablet";
  const BPOM_NUMBER = "BPOM DKL2612345678A1";
  const LOT_NUMBER = "LOT-2026-05A";
  const FACILITY_LOCATION = "PT Kalbe Plant Cikarang, West Java";
  const INITIAL_NOTES = "Batch manufactured, passed internal QA & BPOM specs";

  const DIST_LOCATION = "Gudang Distribusi Kimia Farma Jakarta Timur";
  const DIST_NOTES = "Received in good condition, cold chain monitoring intact";

  const PHARM_LOCATION = "Apotek K-24 Senopati, Jakarta Selatan";
  const PHARM_NOTES = "Received and verified by licensed pharmacist. Shelved.";

  let prodDate;
  let expDate;

  beforeEach(async function () {
    [admin, manufacturer, distributor, pharmacy, consumer, intruder] = await ethers.getSigners();

    const ObtentikFactory = await ethers.getContractFactory("ObtentikSupplyChain");
    obtentik = await ObtentikFactory.deploy(admin.address);
    await obtentik.waitForDeployment();

    // Setup timestamps
    const now = await time.latest();
    prodDate = now;
    expDate = now + 365 * 24 * 3600; // 1 year later

    // Whitelist roles
    await obtentik.connect(admin).registerManufacturer(manufacturer.address, "PT Kalbe Farma Tbk");
    await obtentik.connect(admin).registerDistributor(distributor.address, "PT Kimia Farma Trading & Distribution");
    await obtentik.connect(admin).registerPharmacy(pharmacy.address, "Apotek K-24 Senopati");
  });

  describe("1. Deployment and Access Control Whitelist", function () {
    it("Should configure deployer as DEFAULT_ADMIN_ROLE", async function () {
      const DEFAULT_ADMIN_ROLE = await obtentik.DEFAULT_ADMIN_ROLE();
      expect(await obtentik.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await obtentik.getUserRole(admin.address)).to.equal("ADMIN");
    });

    it("Should correctly assign and return roles for whitelisted actors", async function () {
      expect(await obtentik.getUserRole(manufacturer.address)).to.equal("MANUFACTURER");
      expect(await obtentik.getUserRole(distributor.address)).to.equal("DISTRIBUTOR");
      expect(await obtentik.getUserRole(pharmacy.address)).to.equal("PHARMACY");
      expect(await obtentik.getUserRole(consumer.address)).to.equal("CONSUMER");

      expect(await obtentik.actorNames(manufacturer.address)).to.equal("PT Kalbe Farma Tbk");
      expect(await obtentik.actorNames(distributor.address)).to.equal("PT Kimia Farma Trading & Distribution");
      expect(await obtentik.actorNames(pharmacy.address)).to.equal("Apotek K-24 Senopati");
    });

    it("Should allow admin to revoke an actor", async function () {
      const DISTRIBUTOR_ROLE = await obtentik.DISTRIBUTOR_ROLE();
      await obtentik.connect(admin).revokeActor(DISTRIBUTOR_ROLE, distributor.address);
      expect(await obtentik.hasRole(DISTRIBUTOR_ROLE, distributor.address)).to.be.false;
      expect(await obtentik.getUserRole(distributor.address)).to.equal("CONSUMER");
    });

    it("Should prevent non-admin from registering actors", async function () {
      await expect(
        obtentik.connect(intruder).registerManufacturer(intruder.address, "Fake Manufacturer")
      ).to.be.revertedWithCustomError(obtentik, "AccessControlUnauthorizedAccount");
    });
  });

  describe("2. Batch Registration (Manufacturer)", function () {
    it("Should allow whitelisted manufacturer to register batch and log checkpoint 1", async function () {
      const tx = await obtentik.connect(manufacturer).registerBatch(
        BATCH_ID,
        PRODUCT_NAME,
        BPOM_NUMBER,
        LOT_NUMBER,
        prodDate,
        expDate,
        FACILITY_LOCATION,
        INITIAL_NOTES
      );

      await expect(tx)
        .to.emit(obtentik, "BatchRegistered")
        .withArgs(BATCH_ID, PRODUCT_NAME, BPOM_NUMBER, LOT_NUMBER, manufacturer.address, prodDate, expDate);

      const batch = await obtentik.getBatchDetail(BATCH_ID);
      expect(batch.batchIdOut).to.equal(BATCH_ID);
      expect(batch.productName).to.equal(PRODUCT_NAME);
      expect(batch.bpomNumber).to.equal(BPOM_NUMBER);
      expect(batch.lotNumber).to.equal(LOT_NUMBER);
      expect(batch.manufacturer).to.equal(manufacturer.address);
      expect(batch.currentStage).to.equal(0n); // Manufactured
      expect(batch.isRecalled).to.be.false;
      expect(batch.checkpointCount).to.equal(1n);

      const checkpoints = await obtentik.getBatchCheckpoints(BATCH_ID);
      expect(checkpoints.length).to.equal(1);
      expect(checkpoints[0].stage).to.equal(0n);
      expect(checkpoints[0].actor).to.equal(manufacturer.address);
      expect(checkpoints[0].actorRole).to.equal("MANUFACTURER");
      expect(checkpoints[0].actorName).to.equal("PT Kalbe Farma Tbk");
      expect(checkpoints[0].location).to.equal(FACILITY_LOCATION);
      expect(checkpoints[0].notes).to.equal(INITIAL_NOTES);
    });

    it("Should prevent registering duplicate batchId", async function () {
      await obtentik.connect(manufacturer).registerBatch(
        BATCH_ID,
        PRODUCT_NAME,
        BPOM_NUMBER,
        LOT_NUMBER,
        prodDate,
        expDate,
        FACILITY_LOCATION,
        INITIAL_NOTES
      );

      await expect(
        obtentik.connect(manufacturer).registerBatch(
          BATCH_ID,
          PRODUCT_NAME,
          BPOM_NUMBER,
          LOT_NUMBER,
          prodDate,
          expDate,
          FACILITY_LOCATION,
          INITIAL_NOTES
        )
      ).to.be.revertedWithCustomError(obtentik, "BatchAlreadyExists").withArgs(BATCH_ID);
    });

    it("Should revert if productionDate >= expiryDate", async function () {
      await expect(
        obtentik.connect(manufacturer).registerBatch(
          BATCH_ID,
          PRODUCT_NAME,
          BPOM_NUMBER,
          LOT_NUMBER,
          expDate, // inverted dates
          prodDate,
          FACILITY_LOCATION,
          INITIAL_NOTES
        )
      ).to.be.revertedWithCustomError(obtentik, "InvalidDates");
    });

    it("Should revert if non-manufacturer attempts to register", async function () {
      await expect(
        obtentik.connect(intruder).registerBatch(
          BATCH_ID,
          PRODUCT_NAME,
          BPOM_NUMBER,
          LOT_NUMBER,
          prodDate,
          expDate,
          FACILITY_LOCATION,
          INITIAL_NOTES
        )
      ).to.be.revertedWithCustomError(obtentik, "UnauthorizedActor").withArgs(intruder.address);
    });
  });

  describe("3. Supply Chain Flow (Manufacturer -> Distributor -> Pharmacy)", function () {
    beforeEach(async function () {
      await obtentik.connect(manufacturer).registerBatch(
        BATCH_ID,
        PRODUCT_NAME,
        BPOM_NUMBER,
        LOT_NUMBER,
        prodDate,
        expDate,
        FACILITY_LOCATION,
        INITIAL_NOTES
      );
    });

    it("Should allow distributor to add checkpoint (transitions Manufactured -> Distributed)", async function () {
      const tx = await obtentik.connect(distributor).addCheckpoint(
        BATCH_ID,
        DIST_LOCATION,
        DIST_NOTES
      );

      await expect(tx)
        .to.emit(obtentik, "CheckpointAdded")
        .withArgs(BATCH_ID, 1n, distributor.address, "DISTRIBUTOR", DIST_LOCATION, await time.latest());

      const batch = await obtentik.getBatchDetail(BATCH_ID);
      expect(batch.currentStage).to.equal(1n); // Distributed
      expect(batch.checkpointCount).to.equal(2n);

      const checkpoints = await obtentik.getBatchCheckpoints(BATCH_ID);
      expect(checkpoints.length).to.equal(2);
      expect(checkpoints[1].actorRole).to.equal("DISTRIBUTOR");
      expect(checkpoints[1].actorName).to.equal("PT Kimia Farma Trading & Distribution");
      expect(checkpoints[1].location).to.equal(DIST_LOCATION);
    });

    it("Should prevent pharmacy from adding checkpoint before distributor (Strict Sequence Check)", async function () {
      // Current stage is Manufactured (0). Pharmacy expects Distributed (1).
      await expect(
        obtentik.connect(pharmacy).addCheckpoint(BATCH_ID, PHARM_LOCATION, PHARM_NOTES)
      ).to.be.revertedWithCustomError(obtentik, "InvalidSupplyChainSequence")
       .withArgs(1n, 0n); // expected Distributed (1), got Manufactured (0)
    });

    it("Should complete full 3-tier sequence: Manufacturer -> Distributor -> Pharmacy", async function () {
      // Step 2: Distributor checkpoint
      await obtentik.connect(distributor).verifyCheckpoint(BATCH_ID, DIST_LOCATION, DIST_NOTES);

      // Step 3: Pharmacy checkpoint
      await obtentik.connect(pharmacy).verifyCheckpoint(BATCH_ID, PHARM_LOCATION, PHARM_NOTES);

      const batch = await obtentik.getBatchDetail(BATCH_ID);
      expect(batch.currentStage).to.equal(2n); // AtPharmacy
      expect(batch.checkpointCount).to.equal(3n);

      const checkpoints = await obtentik.getBatchCheckpoints(BATCH_ID);
      expect(checkpoints.length).to.equal(3);
      expect(checkpoints[0].actorRole).to.equal("MANUFACTURER");
      expect(checkpoints[1].actorRole).to.equal("DISTRIBUTOR");
      expect(checkpoints[2].actorRole).to.equal("PHARMACY");
    });

    it("Should prevent distributor from adding checkpoint again once already Distributed", async function () {
      await obtentik.connect(distributor).addCheckpoint(BATCH_ID, DIST_LOCATION, DIST_NOTES);

      await expect(
        obtentik.connect(distributor).addCheckpoint(BATCH_ID, "Warehouse 2", "Another note")
      ).to.be.revertedWithCustomError(obtentik, "InvalidSupplyChainSequence")
       .withArgs(0n, 1n); // expected Manufactured (0), current is Distributed (1)
    });

    it("Should prevent unauthorized third party from adding checkpoint", async function () {
      await expect(
        obtentik.connect(consumer).addCheckpoint(BATCH_ID, "Fake Location", "Fake Note")
      ).to.be.revertedWithCustomError(obtentik, "UnauthorizedActor").withArgs(consumer.address);
    });
  });

  describe("4. Batch Recall Management", function () {
    beforeEach(async function () {
      await obtentik.connect(manufacturer).registerBatch(
        BATCH_ID,
        PRODUCT_NAME,
        BPOM_NUMBER,
        LOT_NUMBER,
        prodDate,
        expDate,
        FACILITY_LOCATION,
        INITIAL_NOTES
      );
    });

    it("Should allow the batch manufacturer to recall the batch", async function () {
      const reason = "Contains unapproved excipients (BKO test positive)";
      await expect(
        obtentik.connect(manufacturer).setBatchRecallStatus(BATCH_ID, true, reason)
      )
        .to.emit(obtentik, "BatchRecallStatusChanged")
        .withArgs(BATCH_ID, true, reason, manufacturer.address);

      const batch = await obtentik.getBatchDetail(BATCH_ID);
      expect(batch.isRecalled).to.be.true;
      expect(batch.recallReason).to.equal(reason);
    });

    it("Should allow Admin to recall the batch", async function () {
      const reason = "Regulatory order by BPOM";
      await obtentik.connect(admin).setBatchRecallStatus(BATCH_ID, true, reason);

      const batch = await obtentik.getBatchDetail(BATCH_ID);
      expect(batch.isRecalled).to.be.true;
    });

    it("Should prevent non-owner/non-admin from recalling batch", async function () {
      await expect(
        obtentik.connect(intruder).setBatchRecallStatus(BATCH_ID, true, "Hacked")
      ).to.be.revertedWithCustomError(obtentik, "UnauthorizedActor").withArgs(intruder.address);
    });

    it("Should block adding checkpoints if batch is recalled", async function () {
      await obtentik.connect(admin).setBatchRecallStatus(BATCH_ID, true, "Safety warning");

      await expect(
        obtentik.connect(distributor).addCheckpoint(BATCH_ID, DIST_LOCATION, DIST_NOTES)
      ).to.be.revertedWithCustomError(obtentik, "BatchAlreadyRecalled").withArgs(BATCH_ID);
    });
  });

  describe("5. Public Consumer Verification (QR Code Scan)", function () {
    it("Should return NOT_FOUND for non-existent batch", async function () {
      const res = await obtentik.verifyBatch("NON_EXISTENT_ID");
      expect(res.isValid).to.be.false;
      expect(res.isAuthentic).to.be.false;
      expect(res.isRecalled).to.be.false;
      expect(res.statusMessage).to.include("NOT_FOUND");
    });

    it("Should verify authentic registered batch", async function () {
      await obtentik.connect(manufacturer).registerBatch(
        BATCH_ID,
        PRODUCT_NAME,
        BPOM_NUMBER,
        LOT_NUMBER,
        prodDate,
        expDate,
        FACILITY_LOCATION,
        INITIAL_NOTES
      );

      const res = await obtentik.verifyBatch(BATCH_ID);
      expect(res.isValid).to.be.true;
      expect(res.isAuthentic).to.be.true;
      expect(res.isRecalled).to.be.false;
      expect(res.isExpired).to.be.false;
      expect(res.statusMessage).to.include("AUTHENTIC");
      expect(res.checkpointCount).to.equal(1n);
    });

    it("Should flag batch if recalled", async function () {
      await obtentik.connect(manufacturer).registerBatch(
        BATCH_ID,
        PRODUCT_NAME,
        BPOM_NUMBER,
        LOT_NUMBER,
        prodDate,
        expDate,
        FACILITY_LOCATION,
        INITIAL_NOTES
      );
      await obtentik.connect(admin).setBatchRecallStatus(BATCH_ID, true, "BKO contamination");

      const res = await obtentik.verifyBatch(BATCH_ID);
      expect(res.isValid).to.be.true;
      expect(res.isAuthentic).to.be.false;
      expect(res.isRecalled).to.be.true;
      expect(res.statusMessage).to.include("RECALLED");
    });

    it("Should flag batch if expired", async function () {
      await obtentik.connect(manufacturer).registerBatch(
        BATCH_ID,
        PRODUCT_NAME,
        BPOM_NUMBER,
        LOT_NUMBER,
        prodDate,
        expDate,
        FACILITY_LOCATION,
        INITIAL_NOTES
      );

      // Fast forward time past expiry date
      await time.increaseTo(expDate + 10);

      const res = await obtentik.verifyBatch(BATCH_ID);
      expect(res.isValid).to.be.true;
      expect(res.isAuthentic).to.be.false;
      expect(res.isExpired).to.be.true;
      expect(res.statusMessage).to.include("EXPIRED");
    });

    it("Should list all batches and total batch count", async function () {
      await obtentik.connect(manufacturer).registerBatch(
        "BATCH-001",
        "Amoxicillin 500mg",
        "BPOM DKL111",
        "LOT-01",
        prodDate,
        expDate,
        "Loc 1",
        "Notes 1"
      );
      await obtentik.connect(manufacturer).registerBatch(
        "BATCH-002",
        "Ibuprofen 400mg",
        "BPOM DKL222",
        "LOT-02",
        prodDate,
        expDate,
        "Loc 2",
        "Notes 2"
      );

      expect(await obtentik.getBatchCount()).to.equal(2n);
      const all = await obtentik.getAllBatches();
      expect(all).to.deep.equal(["BATCH-001", "BATCH-002"]);
    });
  });
});
