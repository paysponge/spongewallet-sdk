#!/usr/bin/env node

import { deviceFlowAuth } from "../auth/device-flow.js";
import {
  loadCredentials,
  deleteCredentials,
  getCredentialsPath,
} from "../auth/credentials.js";

const VERSION = "0.1.0";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "login":
      await login(args.slice(1));
      break;
    case "logout":
      await logout();
      break;
    case "whoami":
      await whoami();
      break;
    case "version":
    case "--version":
    case "-v":
      console.log(`@spongewallet/sdk v${VERSION}`);
      break;
    case "help":
    case "--help":
    case "-h":
    default:
      printHelp();
      break;
  }
}

async function login(args: string[]) {
  const options: { testnet?: boolean; noBrowser?: boolean; baseUrl?: string } =
    {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--testnet" || arg === "-t") {
      options.testnet = true;
    } else if (arg === "--no-browser") {
      options.noBrowser = true;
    } else if (arg === "--base-url" && args[i + 1]) {
      options.baseUrl = args[++i];
    }
  }

  try {
    await deviceFlowAuth(options);
  } catch (error) {
    console.error(
      "Login failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

async function logout() {
  const creds = loadCredentials();

  if (!creds) {
    console.log("Not logged in.");
    return;
  }

  deleteCredentials();
  console.log("Logged out successfully.");
  console.log(`Removed credentials from ${getCredentialsPath()}`);
}

async function whoami() {
  const creds = loadCredentials();

  if (!creds) {
    console.log("Not logged in.");
    console.log("Run `spongewallet login` to authenticate.");
    return;
  }

  console.log("Logged in as:");
  console.log(`  Agent ID: ${creds.agentId}`);
  if (creds.agentName) {
    console.log(`  Agent Name: ${creds.agentName}`);
  }
  console.log(`  API Key: ${creds.apiKey.substring(0, 20)}...`);
  if (creds.testnet) {
    console.log("  Mode: Testnet only");
  }
  console.log(`  Credentials: ${getCredentialsPath()}`);
}

function printHelp() {
  console.log(`
@spongewallet/sdk - CLI for managing agent wallets

Usage:
  spongewallet <command> [options]

Commands:
  login     Authenticate with SpongeWallet (opens browser)
  logout    Remove stored credentials
  whoami    Show current authentication status
  version   Show version number
  help      Show this help message

Login Options:
  --testnet, -t    Use testnets only
  --no-browser     Don't auto-open browser
  --base-url URL   Use custom API URL

Examples:
  spongewallet login                    # Authenticate
  spongewallet login --testnet          # Authenticate for testnets only
  spongewallet whoami                   # Show current status
  spongewallet logout                   # Remove credentials

Environment Variables:
  SPONGE_API_KEY    API key (skips login if set)

For more information, visit: https://docs.spongewallet.com
`);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
