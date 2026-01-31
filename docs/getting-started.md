# Getting Started

## Installation

```bash
bun add @spongewallet/sdk
```

## Quick Start

### Connect to a wallet

```typescript
import { SpongeWallet } from "@spongewallet/sdk";

const wallet = await SpongeWallet.connect();

// Get addresses
const addresses = await wallet.getAddresses();
console.log(addresses.base);    // 0x...
console.log(addresses.solana);  // 5x...

// Check balances
const balances = await wallet.getBalances();
console.log(balances);
```

On first run, `connect()` opens your browser for login via the OAuth Device Flow. After approval, your API key is cached at `~/.spongewallet/credentials.json`.

### Connect with an existing API key

```typescript
const wallet = await SpongeWallet.connect({
  apiKey: "sponge_test_...",
});
```

Or set the `SPONGE_API_KEY` environment variable:

```bash
SPONGE_API_KEY=sponge_test_xxx bun run my-bot.ts
```

### Connect options

```typescript
const wallet = await SpongeWallet.connect({
  name: "My Bot",           // Agent name (creates new agent if needed)
  agentId: "uuid-...",      // Connect to specific agent
  apiKey: "sponge_test_...",// Skip device flow
  testnet: true,            // Use testnets only
  baseUrl: "http://...",    // Custom API URL
  noBrowser: true,          // Don't auto-open browser
});
```

## Programmatic Agent Creation

Use a master API key to spin up agents without browser auth:

```typescript
import { SpongeAdmin } from "@spongewallet/sdk";

// First time: authenticate via browser to get a master key
const admin = await SpongeAdmin.connect();

// Or use an existing master key
const admin = new SpongeAdmin({ apiKey: "sponge_master_..." });

// Create agents programmatically
const { agent, apiKey } = await admin.createAgent({ name: "bot-1" });

// Connect to the agent's wallet
const wallet = await SpongeWallet.connect({ apiKey });
```

See [Master Keys](./master-keys.md) for details.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SPONGE_API_KEY` | Agent API key (skips device flow) |
| `SPONGE_MASTER_KEY` | Master key for programmatic agent creation |
| `SPONGE_API_URL` | Custom backend URL (default: `https://api.wallet.paysponge.com`) |

## What Happens on Connect

1. Checks for API key in options, `SPONGE_API_KEY` env var, or `~/.spongewallet/credentials.json`
2. If no key found, starts the OAuth Device Flow (opens browser)
3. Resolves the agent associated with the key
4. Returns a `SpongeWallet` instance ready for use

Each agent has wallets auto-created for all supported chains (EVM + Solana). The same EVM address works across Ethereum, Base, Sepolia, Base Sepolia, and Tempo. The same Solana keypair works on mainnet and devnet.
