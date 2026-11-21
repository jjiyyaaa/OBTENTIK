export declare const OBTENTIK_CONTRACT_ADDRESS: "0x511251E3b80e72d437E479B6D6039992Db813049";
export declare const OBTENTIK_CHAIN_ID = 80002;
export declare const OBTENTIK_NETWORK_NAME = "polygonAmoy";
export declare const OBTENTIK_EXPLORER_URL = "https://amoy.polygonscan.com/address/0x511251E3b80e72d437E479B6D6039992Db813049";
export declare const OBTENTIK_ABI: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "initialAdmin";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [];
    readonly name: "AccessControlBadConfirmation";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "bytes32";
        readonly name: "neededRole";
        readonly type: "bytes32";
    }];
    readonly name: "AccessControlUnauthorizedAccount";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }];
    readonly name: "BatchAlreadyExists";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }];
    readonly name: "BatchAlreadyRecalled";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }];
    readonly name: "BatchNotFound";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "fieldName";
        readonly type: "string";
    }];
    readonly name: "EmptyStringNotAllowed";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "productionDate";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "expiryDate";
        readonly type: "uint256";
    }];
    readonly name: "InvalidDates";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
        readonly name: "expected";
        readonly type: "uint8";
    }, {
        readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
        readonly name: "current";
        readonly type: "uint8";
    }];
    readonly name: "InvalidSupplyChainSequence";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "caller";
        readonly type: "address";
    }];
    readonly name: "UnauthorizedActor";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "ZeroAddressNotAllowed";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }];
    readonly name: "ActorRegistered";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }];
    readonly name: "ActorRevoked";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "bool";
        readonly name: "isRecalled";
        readonly type: "bool";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "recallReason";
        readonly type: "string";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "updatedBy";
        readonly type: "address";
    }];
    readonly name: "BatchRecallStatusChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "productName";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "bpomNumber";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "lotNumber";
        readonly type: "string";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "manufacturer";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "productionDate";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "expiryDate";
        readonly type: "uint256";
    }];
    readonly name: "BatchRegistered";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }, {
        readonly indexed: true;
        readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
        readonly name: "stage";
        readonly type: "uint8";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "actor";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "role";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "string";
        readonly name: "location";
        readonly type: "string";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "timestamp";
        readonly type: "uint256";
    }];
    readonly name: "CheckpointAdded";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "previousAdminRole";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "newAdminRole";
        readonly type: "bytes32";
    }];
    readonly name: "RoleAdminChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }];
    readonly name: "RoleGranted";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }];
    readonly name: "RoleRevoked";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "DEFAULT_ADMIN_ROLE";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "DISTRIBUTOR_ROLE";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "MANUFACTURER_ROLE";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "PHARMACY_ROLE";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "actorNames";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "location";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "notes";
        readonly type: "string";
    }];
    readonly name: "addCheckpoint";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getAllBatches";
    readonly outputs: readonly [{
        readonly internalType: "string[]";
        readonly name: "";
        readonly type: "string[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }];
    readonly name: "getBatchCheckpoints";
    readonly outputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
            readonly name: "stage";
            readonly type: "uint8";
        }, {
            readonly internalType: "address";
            readonly name: "actor";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "actorRole";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "actorName";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "location";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "notes";
            readonly type: "string";
        }, {
            readonly internalType: "uint256";
            readonly name: "timestamp";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ObtentikSupplyChain.Checkpoint[]";
        readonly name: "";
        readonly type: "tuple[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "getBatchCount";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }];
    readonly name: "getBatchDetail";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchIdOut";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "productName";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "bpomNumber";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "lotNumber";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "productionDate";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "expiryDate";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "manufacturer";
        readonly type: "address";
    }, {
        readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
        readonly name: "currentStage";
        readonly type: "uint8";
    }, {
        readonly internalType: "bool";
        readonly name: "isRecalled";
        readonly type: "bool";
    }, {
        readonly internalType: "string";
        readonly name: "recallReason";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "checkpointCount";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "registeredAt";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }];
    readonly name: "getRoleAdmin";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "getUserRole";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "roleName";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "grantRole";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "hasRole";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "productName";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "bpomNumber";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "lotNumber";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "productionDate";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "expiryDate";
        readonly type: "uint256";
    }, {
        readonly internalType: "string";
        readonly name: "facilityLocation";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "initialNotes";
        readonly type: "string";
    }];
    readonly name: "registerBatch";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }];
    readonly name: "registerDistributor";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }];
    readonly name: "registerManufacturer";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }];
    readonly name: "registerPharmacy";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "callerConfirmation";
        readonly type: "address";
    }];
    readonly name: "renounceRole";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "revokeActor";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "role";
        readonly type: "bytes32";
    }, {
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "revokeRole";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }, {
        readonly internalType: "bool";
        readonly name: "isRecalled";
        readonly type: "bool";
    }, {
        readonly internalType: "string";
        readonly name: "recallReason";
        readonly type: "string";
    }];
    readonly name: "setBatchRecallStatus";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes4";
        readonly name: "interfaceId";
        readonly type: "bytes4";
    }];
    readonly name: "supportsInterface";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }];
    readonly name: "verifyBatch";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "isValid";
        readonly type: "bool";
    }, {
        readonly internalType: "bool";
        readonly name: "isAuthentic";
        readonly type: "bool";
    }, {
        readonly internalType: "bool";
        readonly name: "isRecalled";
        readonly type: "bool";
    }, {
        readonly internalType: "bool";
        readonly name: "isExpired";
        readonly type: "bool";
    }, {
        readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
        readonly name: "currentStage";
        readonly type: "uint8";
    }, {
        readonly internalType: "string";
        readonly name: "statusMessage";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "checkpointCount";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "batchId";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "location";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "notes";
        readonly type: "string";
    }];
    readonly name: "verifyCheckpoint";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
declare const _default: {
    address: "0x511251E3b80e72d437E479B6D6039992Db813049";
    chainId: number;
    network: string;
    explorerUrl: string;
    abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "initialAdmin";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "AccessControlBadConfirmation";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "neededRole";
            readonly type: "bytes32";
        }];
        readonly name: "AccessControlUnauthorizedAccount";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }];
        readonly name: "BatchAlreadyExists";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }];
        readonly name: "BatchAlreadyRecalled";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }];
        readonly name: "BatchNotFound";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "fieldName";
            readonly type: "string";
        }];
        readonly name: "EmptyStringNotAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "productionDate";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "expiryDate";
            readonly type: "uint256";
        }];
        readonly name: "InvalidDates";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
            readonly name: "expected";
            readonly type: "uint8";
        }, {
            readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
            readonly name: "current";
            readonly type: "uint8";
        }];
        readonly name: "InvalidSupplyChainSequence";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "caller";
            readonly type: "address";
        }];
        readonly name: "UnauthorizedActor";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroAddressNotAllowed";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "name";
            readonly type: "string";
        }];
        readonly name: "ActorRegistered";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }];
        readonly name: "ActorRevoked";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "isRecalled";
            readonly type: "bool";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "recallReason";
            readonly type: "string";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "updatedBy";
            readonly type: "address";
        }];
        readonly name: "BatchRecallStatusChanged";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "productName";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "bpomNumber";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "lotNumber";
            readonly type: "string";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "manufacturer";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "productionDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expiryDate";
            readonly type: "uint256";
        }];
        readonly name: "BatchRegistered";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }, {
            readonly indexed: true;
            readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
            readonly name: "stage";
            readonly type: "uint8";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "actor";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "role";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "location";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "timestamp";
            readonly type: "uint256";
        }];
        readonly name: "CheckpointAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "previousAdminRole";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "newAdminRole";
            readonly type: "bytes32";
        }];
        readonly name: "RoleAdminChanged";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }];
        readonly name: "RoleGranted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }];
        readonly name: "RoleRevoked";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "DEFAULT_ADMIN_ROLE";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "DISTRIBUTOR_ROLE";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "MANUFACTURER_ROLE";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "PHARMACY_ROLE";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly name: "actorNames";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "";
            readonly type: "string";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "location";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "notes";
            readonly type: "string";
        }];
        readonly name: "addCheckpoint";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getAllBatches";
        readonly outputs: readonly [{
            readonly internalType: "string[]";
            readonly name: "";
            readonly type: "string[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }];
        readonly name: "getBatchCheckpoints";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
                readonly name: "stage";
                readonly type: "uint8";
            }, {
                readonly internalType: "address";
                readonly name: "actor";
                readonly type: "address";
            }, {
                readonly internalType: "string";
                readonly name: "actorRole";
                readonly type: "string";
            }, {
                readonly internalType: "string";
                readonly name: "actorName";
                readonly type: "string";
            }, {
                readonly internalType: "string";
                readonly name: "location";
                readonly type: "string";
            }, {
                readonly internalType: "string";
                readonly name: "notes";
                readonly type: "string";
            }, {
                readonly internalType: "uint256";
                readonly name: "timestamp";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ObtentikSupplyChain.Checkpoint[]";
            readonly name: "";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getBatchCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }];
        readonly name: "getBatchDetail";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchIdOut";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "productName";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "bpomNumber";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "lotNumber";
            readonly type: "string";
        }, {
            readonly internalType: "uint256";
            readonly name: "productionDate";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "expiryDate";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "manufacturer";
            readonly type: "address";
        }, {
            readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
            readonly name: "currentStage";
            readonly type: "uint8";
        }, {
            readonly internalType: "bool";
            readonly name: "isRecalled";
            readonly type: "bool";
        }, {
            readonly internalType: "string";
            readonly name: "recallReason";
            readonly type: "string";
        }, {
            readonly internalType: "uint256";
            readonly name: "checkpointCount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "registeredAt";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }];
        readonly name: "getRoleAdmin";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "getUserRole";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "roleName";
            readonly type: "string";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "grantRole";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "hasRole";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "productName";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "bpomNumber";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "lotNumber";
            readonly type: "string";
        }, {
            readonly internalType: "uint256";
            readonly name: "productionDate";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "expiryDate";
            readonly type: "uint256";
        }, {
            readonly internalType: "string";
            readonly name: "facilityLocation";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "initialNotes";
            readonly type: "string";
        }];
        readonly name: "registerBatch";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "name";
            readonly type: "string";
        }];
        readonly name: "registerDistributor";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "name";
            readonly type: "string";
        }];
        readonly name: "registerManufacturer";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "name";
            readonly type: "string";
        }];
        readonly name: "registerPharmacy";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "callerConfirmation";
            readonly type: "address";
        }];
        readonly name: "renounceRole";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "revokeActor";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "revokeRole";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }, {
            readonly internalType: "bool";
            readonly name: "isRecalled";
            readonly type: "bool";
        }, {
            readonly internalType: "string";
            readonly name: "recallReason";
            readonly type: "string";
        }];
        readonly name: "setBatchRecallStatus";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "interfaceId";
            readonly type: "bytes4";
        }];
        readonly name: "supportsInterface";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }];
        readonly name: "verifyBatch";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "isValid";
            readonly type: "bool";
        }, {
            readonly internalType: "bool";
            readonly name: "isAuthentic";
            readonly type: "bool";
        }, {
            readonly internalType: "bool";
            readonly name: "isRecalled";
            readonly type: "bool";
        }, {
            readonly internalType: "bool";
            readonly name: "isExpired";
            readonly type: "bool";
        }, {
            readonly internalType: "enum ObtentikSupplyChain.SupplyChainStage";
            readonly name: "currentStage";
            readonly type: "uint8";
        }, {
            readonly internalType: "string";
            readonly name: "statusMessage";
            readonly type: "string";
        }, {
            readonly internalType: "uint256";
            readonly name: "checkpointCount";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "batchId";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "location";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "notes";
            readonly type: "string";
        }];
        readonly name: "verifyCheckpoint";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
};
export default _default;
