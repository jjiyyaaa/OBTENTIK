#!/usr/bin/env node
const path = require("path");
const fs = require("fs");

const appDataDir = path.join(__dirname, ".appdata");
const roamingDir = path.join(appDataDir, "roaming");
const localDir = path.join(appDataDir, "local");

if (!fs.existsSync(roamingDir)) fs.mkdirSync(roamingDir, { recursive: true });
if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

process.env.APPDATA = roamingDir;
process.env.LOCALAPPDATA = localDir;

// Delegate directly to Hardhat CLI
require("hardhat/internal/cli/cli");
