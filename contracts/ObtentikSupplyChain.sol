// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ObtentikSupplyChain
 * @dev Smart Contract for OBTENTIK - Blockchain-based Pharmaceutical Supply Chain & Verification
 *      Built for HackSphere 2026 by Team imouttt (President University).
 *      Implements an immutable 3-tier supply chain:
 *      Manufacturer -> Distributor -> Pharmacy -> Consumer.
 */
contract ObtentikSupplyChain is AccessControl {

    // --- ROLES DEFINITIONS ---
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");

    // --- ENUMS & STRUCTS ---
    enum SupplyChainStage {
        Manufactured, // 0: Batch registered and produced by Manufacturer
        Distributed,  // 1: Received and logged by Authorized Distributor
        AtPharmacy    // 2: Received, verified, and shelved by Licensed Pharmacy
    }

    struct Checkpoint {
        SupplyChainStage stage;
        address actor;
        string actorRole;     // "MANUFACTURER", "DISTRIBUTOR", "PHARMACY"
        string actorName;     // Registered business/entity name
        string location;      // Facility / Warehouse / Pharmacy location
        string notes;         // Quality inspection / receipt notes
        uint256 timestamp;    // Block timestamp
    }

    struct Batch {
        string batchId;                 // Unique identifier printed on QR (e.g. BATCH-2026-PARA500)
        string productName;             // Generic / Brand name of medicine
        string bpomNumber;              // Indonesian BPOM marketing authorization number
        string lotNumber;               // Manufacturing lot number
        uint256 productionDate;         // Production date (epoch)
        uint256 expiryDate;             // Expiration date (epoch)
        address manufacturer;           // Wallet of the registered manufacturer
        SupplyChainStage currentStage;  // Current stage in the supply chain
        bool isRecalled;                // Recall flag
        string recallReason;            // Recall explanation if applicable
        bool isRegistered;              // Existence flag
        uint256 registeredAt;           // Registration timestamp
        Checkpoint[] checkpoints;       // Immutable timeline of checkpoints
    }

    // --- STORAGE ---
    mapping(string => Batch) private _batches;
    string[] private _batchIds;

    // Mapping for whitelisted actor corporate/facility names
    mapping(address => string) public actorNames;

    // --- EVENTS ---
    event ActorRegistered(address indexed account, bytes32 indexed role, string name);
    event ActorRevoked(address indexed account, bytes32 indexed role);

    event BatchRegistered(
        string indexed batchId,
        string productName,
        string bpomNumber,
        string lotNumber,
        address indexed manufacturer,
        uint256 productionDate,
        uint256 expiryDate
    );

    event CheckpointAdded(
        string indexed batchId,
        SupplyChainStage indexed stage,
        address indexed actor,
        string role,
        string location,
        uint256 timestamp
    );

    event BatchRecallStatusChanged(
        string indexed batchId,
        bool isRecalled,
        string recallReason,
        address indexed updatedBy
    );

    // --- CUSTOM ERRORS ---
    error BatchAlreadyExists(string batchId);
    error BatchNotFound(string batchId);
    error BatchAlreadyRecalled(string batchId);
    error InvalidDates(uint256 productionDate, uint256 expiryDate);
    error EmptyStringNotAllowed(string fieldName);
    error InvalidSupplyChainSequence(SupplyChainStage expected, SupplyChainStage current);
    error UnauthorizedActor(address caller);
    error ZeroAddressNotAllowed();

    /**
     * @dev Constructor assigns DEFAULT_ADMIN_ROLE to deployer.
     *      Admin can grant roles to manufacturers, distributors, and pharmacies.
     */
    constructor(address initialAdmin) {
        if (initialAdmin == address(0)) revert ZeroAddressNotAllowed();
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
    }

    // =========================================================================
    // WHITELIST & ROLE MANAGEMENT FUNCTIONS
    // =========================================================================

    /**
     * @notice Registers and whitelists a pharmaceutical manufacturer
     */
    function registerManufacturer(address account, string memory name) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        if (bytes(name).length == 0) revert EmptyStringNotAllowed("name");

        _grantRole(MANUFACTURER_ROLE, account);
        actorNames[account] = name;
        emit ActorRegistered(account, MANUFACTURER_ROLE, name);
    }

    /**
     * @notice Registers and whitelists an authorized distributor
     */
    function registerDistributor(address account, string memory name) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        if (bytes(name).length == 0) revert EmptyStringNotAllowed("name");

        _grantRole(DISTRIBUTOR_ROLE, account);
        actorNames[account] = name;
        emit ActorRegistered(account, DISTRIBUTOR_ROLE, name);
    }

    /**
     * @notice Registers and whitelists a licensed pharmacy
     */
    function registerPharmacy(address account, string memory name) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        if (bytes(name).length == 0) revert EmptyStringNotAllowed("name");

        _grantRole(PHARMACY_ROLE, account);
        actorNames[account] = name;
        emit ActorRegistered(account, PHARMACY_ROLE, name);
    }

    /**
     * @notice Revokes a role from an actor
     */
    function revokeActor(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(role, account);
        emit ActorRevoked(account, role);
    }

    /**
     * @notice Returns the primary role of a given wallet address for frontend view routing
     * @param account Address to check
     * @return roleName "ADMIN", "MANUFACTURER", "DISTRIBUTOR", "PHARMACY", or "CONSUMER"
     */
    function getUserRole(address account) external view returns (string memory roleName) {
        if (hasRole(DEFAULT_ADMIN_ROLE, account)) {
            return "ADMIN";
        }
        if (hasRole(MANUFACTURER_ROLE, account)) {
            return "MANUFACTURER";
        }
        if (hasRole(DISTRIBUTOR_ROLE, account)) {
            return "DISTRIBUTOR";
        }
        if (hasRole(PHARMACY_ROLE, account)) {
            return "PHARMACY";
        }
        return "CONSUMER";
    }

    // =========================================================================
    // SUPPLY CHAIN CORE FUNCTIONS
    // =========================================================================

    /**
     * @notice Registers a new medicine batch and records the first checkpoint (Manufactured)
     * @dev Only callable by accounts with MANUFACTURER_ROLE or DEFAULT_ADMIN_ROLE
     */
    function registerBatch(
        string memory batchId,
        string memory productName,
        string memory bpomNumber,
        string memory lotNumber,
        uint256 productionDate,
        uint256 expiryDate,
        string memory facilityLocation,
        string memory initialNotes
    ) external {
        if (!hasRole(MANUFACTURER_ROLE, msg.sender) && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedActor(msg.sender);
        }
        if (bytes(batchId).length == 0) revert EmptyStringNotAllowed("batchId");
        if (bytes(productName).length == 0) revert EmptyStringNotAllowed("productName");
        if (bytes(bpomNumber).length == 0) revert EmptyStringNotAllowed("bpomNumber");
        if (bytes(lotNumber).length == 0) revert EmptyStringNotAllowed("lotNumber");
        if (productionDate >= expiryDate) revert InvalidDates(productionDate, expiryDate);
        if (_batches[batchId].isRegistered) revert BatchAlreadyExists(batchId);

        Batch storage newBatch = _batches[batchId];
        newBatch.batchId = batchId;
        newBatch.productName = productName;
        newBatch.bpomNumber = bpomNumber;
        newBatch.lotNumber = lotNumber;
        newBatch.productionDate = productionDate;
        newBatch.expiryDate = expiryDate;
        newBatch.manufacturer = msg.sender;
        newBatch.currentStage = SupplyChainStage.Manufactured;
        newBatch.isRecalled = false;
        newBatch.recallReason = "";
        newBatch.isRegistered = true;
        newBatch.registeredAt = block.timestamp;

        string memory mfgName = bytes(actorNames[msg.sender]).length > 0 
            ? actorNames[msg.sender] 
            : "Authorized Manufacturer";

        // Initial checkpoint automatically created
        newBatch.checkpoints.push(Checkpoint({
            stage: SupplyChainStage.Manufactured,
            actor: msg.sender,
            actorRole: "MANUFACTURER",
            actorName: mfgName,
            location: bytes(facilityLocation).length > 0 ? facilityLocation : "Production Facility",
            notes: bytes(initialNotes).length > 0 ? initialNotes : "Batch registered and passed Quality Control",
            timestamp: block.timestamp
        }));

        _batchIds.push(batchId);

        emit BatchRegistered(
            batchId,
            productName,
            bpomNumber,
            lotNumber,
            msg.sender,
            productionDate,
            expiryDate
        );

        emit CheckpointAdded(
            batchId,
            SupplyChainStage.Manufactured,
            msg.sender,
            "MANUFACTURER",
            facilityLocation,
            block.timestamp
        );
    }

    /**
     * @notice Records a new supply chain checkpoint as goods are received
     * @dev Strictly enforces the supply chain custody flow:
     *      - Distributor can only record if current stage is Manufactured (transitions to Distributed)
     *      - Pharmacy can only record if current stage is Distributed (transitions to AtPharmacy)
     */
    function addCheckpoint(
        string memory batchId,
        string memory location,
        string memory notes
    ) public {
        Batch storage batch = _batches[batchId];
        if (!batch.isRegistered) revert BatchNotFound(batchId);
        if (batch.isRecalled) revert BatchAlreadyRecalled(batchId);
        if (bytes(location).length == 0) revert EmptyStringNotAllowed("location");

        bool isDistributor = hasRole(DISTRIBUTOR_ROLE, msg.sender);
        bool isPharmacy = hasRole(PHARMACY_ROLE, msg.sender);

        if (!isDistributor && !isPharmacy) {
            revert UnauthorizedActor(msg.sender);
        }

        if (isDistributor) {
            // Distributor must receive directly from Manufacturer
            if (batch.currentStage != SupplyChainStage.Manufactured) {
                revert InvalidSupplyChainSequence(SupplyChainStage.Manufactured, batch.currentStage);
            }

            batch.currentStage = SupplyChainStage.Distributed;
            string memory distName = bytes(actorNames[msg.sender]).length > 0 
                ? actorNames[msg.sender] 
                : "Authorized Distributor";

            batch.checkpoints.push(Checkpoint({
                stage: SupplyChainStage.Distributed,
                actor: msg.sender,
                actorRole: "DISTRIBUTOR",
                actorName: distName,
                location: location,
                notes: bytes(notes).length > 0 ? notes : "Received and verified at distribution warehouse",
                timestamp: block.timestamp
            }));

            emit CheckpointAdded(
                batchId,
                SupplyChainStage.Distributed,
                msg.sender,
                "DISTRIBUTOR",
                location,
                block.timestamp
            );
        } else if (isPharmacy) {
            // Pharmacy must receive from Distributor
            if (batch.currentStage != SupplyChainStage.Distributed) {
                revert InvalidSupplyChainSequence(SupplyChainStage.Distributed, batch.currentStage);
            }

            batch.currentStage = SupplyChainStage.AtPharmacy;
            string memory pharmName = bytes(actorNames[msg.sender]).length > 0 
                ? actorNames[msg.sender] 
                : "Licensed Pharmacy";

            batch.checkpoints.push(Checkpoint({
                stage: SupplyChainStage.AtPharmacy,
                actor: msg.sender,
                actorRole: "PHARMACY",
                actorName: pharmName,
                location: location,
                notes: bytes(notes).length > 0 ? notes : "Received, verified by pharmacist, and stocked on shelf",
                timestamp: block.timestamp
            }));

            emit CheckpointAdded(
                batchId,
                SupplyChainStage.AtPharmacy,
                msg.sender,
                "PHARMACY",
                location,
                block.timestamp
            );
        }
    }

    /**
     * @notice Alias for addCheckpoint matching frontend scanner terminology in proposal
     */
    function verifyCheckpoint(
        string memory batchId,
        string memory location,
        string memory notes
    ) external {
        addCheckpoint(batchId, location, notes);
    }

    /**
     * @notice Allows Admin or the original Manufacturer to recall a batch
     * @param batchId Unique batch identifier
     * @param isRecalled True to recall, false to restore
     * @param recallReason Reason for recall (e.g. BKO contamination, quality defect)
     */
    function setBatchRecallStatus(
        string memory batchId,
        bool isRecalled,
        string memory recallReason
    ) external {
        Batch storage batch = _batches[batchId];
        if (!batch.isRegistered) revert BatchNotFound(batchId);

        bool isAdmin = hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
        bool isBatchManufacturer = (batch.manufacturer == msg.sender);

        if (!isAdmin && !isBatchManufacturer) {
            revert UnauthorizedActor(msg.sender);
        }
        if (isRecalled && bytes(recallReason).length == 0) {
            revert EmptyStringNotAllowed("recallReason");
        }

        batch.isRecalled = isRecalled;
        batch.recallReason = recallReason;

        emit BatchRecallStatusChanged(batchId, isRecalled, recallReason, msg.sender);
    }

    // =========================================================================
    // PUBLIC VIEW / CONSUMER VERIFICATION FUNCTIONS (FREE / NO WALLET REQUIRED)
    // =========================================================================

    /**
     * @notice Verifies a medicine batch for consumers scanning the QR code
     * @param batchId Unique identifier from QR code
     * @return isValid Whether batch is registered on-chain
     * @return isAuthentic Whether batch is authentic (valid, not recalled, chain unbroken, not expired)
     * @return isRecalled Whether batch is under recall
     * @return isExpired Whether expiration date has passed
     * @return currentStage Current supply chain stage
     * @return statusMessage Human-readable status description
     * @return checkpointCount Total number of checkpoints recorded
     */
    function verifyBatch(string memory batchId) external view returns (
        bool isValid,
        bool isAuthentic,
        bool isRecalled,
        bool isExpired,
        SupplyChainStage currentStage,
        string memory statusMessage,
        uint256 checkpointCount
    ) {
        Batch storage batch = _batches[batchId];

        if (!batch.isRegistered) {
            return (
                false,
                false,
                false,
                false,
                SupplyChainStage.Manufactured,
                "NOT_FOUND: Product batch is not registered on blockchain",
                0
            );
        }

        uint256 count = batch.checkpoints.length;
        bool expired = block.timestamp > batch.expiryDate;

        if (batch.isRecalled) {
            return (
                true,
                false,
                true,
                expired,
                batch.currentStage,
                string.concat("RECALLED: Batch has been recalled - ", batch.recallReason),
                count
            );
        }

        if (expired) {
            return (
                true,
                false,
                false,
                true,
                batch.currentStage,
                "EXPIRED: Product has passed its expiration date",
                count
            );
        }

        // Authentic batch
        return (
            true,
            true,
            false,
            false,
            batch.currentStage,
            "AUTHENTIC: Product verified through legitimate supply chain",
            count
        );
    }

    /**
     * @notice Returns batch details
     */
    function getBatchDetail(string memory batchId) external view returns (
        string memory batchIdOut,
        string memory productName,
        string memory bpomNumber,
        string memory lotNumber,
        uint256 productionDate,
        uint256 expiryDate,
        address manufacturer,
        SupplyChainStage currentStage,
        bool isRecalled,
        string memory recallReason,
        uint256 checkpointCount,
        uint256 registeredAt
    ) {
        Batch storage batch = _batches[batchId];
        if (!batch.isRegistered) revert BatchNotFound(batchId);

        return (
            batch.batchId,
            batch.productName,
            batch.bpomNumber,
            batch.lotNumber,
            batch.productionDate,
            batch.expiryDate,
            batch.manufacturer,
            batch.currentStage,
            batch.isRecalled,
            batch.recallReason,
            batch.checkpoints.length,
            batch.registeredAt
        );
    }

    /**
     * @notice Returns the full chronological list of checkpoints for a batch
     */
    function getBatchCheckpoints(string memory batchId) external view returns (Checkpoint[] memory) {
        Batch storage batch = _batches[batchId];
        if (!batch.isRegistered) revert BatchNotFound(batchId);
        return batch.checkpoints;
    }

    /**
     * @notice Returns total number of registered batches
     */
    function getBatchCount() external view returns (uint256) {
        return _batchIds.length;
    }

    /**
     * @notice Returns all batch IDs (useful for frontend listing)
     */
    function getAllBatches() external view returns (string[] memory) {
        return _batchIds;
    }
}
