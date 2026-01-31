# Master Keys

Master API keys are user-scoped keys that let you create and manage agents programmatically, without browser-based auth for each agent.

## Generating a Master Key

### Via Device Flow (recommended)

```typescript
import { SpongeAdmin } from "@spongewallet/sdk";

// Opens browser for one-time login, returns a master key
const admin = await SpongeAdmin.connect();
```

The device flow will:
1. Open your browser to the Sponge login page
2. Show a "Generate Master API Key" approval screen
3. Return a `sponge_master_...` key to your terminal

### Via API

If you're already authenticated (e.g., from the dashboard), create a master key with a POST request:

```
POST /api/master-keys
Authorization: Bearer <privy-jwt>
Content-Type: application/json

{ "name": "My Master Key" }
```

Response:
```json
{
  "id": "uuid",
  "apiKey": "sponge_master_...",
  "keyName": "My Master Key",
  "scopes": ["agents:create", "agents:read", "agents:delete"],
  "createdAt": "2025-01-01T00:00:00Z"
}
```

## Using a Master Key

```typescript
import { SpongeAdmin, SpongeWallet } from "@spongewallet/sdk";

const admin = new SpongeAdmin({ apiKey: "sponge_master_..." });

// Create an agent (automatically gets EVM + Solana wallets)
const { agent, apiKey } = await admin.createAgent({
  name: "trading-bot",
  description: "Automated trading agent",
  dailySpendingLimit: "100",
});

console.log(agent.id);  // UUID
console.log(apiKey);     // sponge_test_... (agent-scoped key)

// Connect to the agent's wallet
const wallet = await SpongeWallet.connect({ apiKey });
const balances = await wallet.getBalances();
```

## SpongeAdmin API

### `SpongeAdmin.connect(options?)`

Authenticate via device flow and return a `SpongeAdmin` instance with a master key.

```typescript
const admin = await SpongeAdmin.connect({
  baseUrl: "http://localhost:8000",  // optional
  noBrowser: true,                   // optional
});
```

### `admin.createAgent(options)`

Create a new agent with wallets. Returns the agent and its API key.

```typescript
const { agent, apiKey } = await admin.createAgent({
  name: "my-agent",                    // required
  description: "...",                  // optional
  dailySpendingLimit: "100",           // optional
  weeklySpendingLimit: "500",          // optional
  monthlySpendingLimit: "2000",        // optional
});
```

### `admin.createWallet(options)`

Convenience method: creates an agent and returns a connected `SpongeWallet` instance.

```typescript
const wallet = await admin.createWallet({ name: "my-agent" });
const balances = await wallet.getBalances();
```

### `admin.listAgents()`

List all agents for your account.

```typescript
const agents = await admin.listAgents();
for (const agent of agents) {
  console.log(`${agent.name} (${agent.id})`);
}
```

### `admin.deleteAgent(agentId)`

Delete an agent (soft delete).

```typescript
await admin.deleteAgent("uuid-...");
```

## Managing Master Keys

List and revoke master keys via the API (requires Privy JWT auth):

```
GET  /api/master-keys           # List your master keys
DELETE /api/master-keys/:id     # Revoke a master key
```

## Key Prefixes

| Prefix | Scope | Description |
|--------|-------|-------------|
| `sponge_master_` | User | Can create/list/delete agents |
| `sponge_test_` | Agent | Full access to one agent (test mode) |
| `sponge_live_` | Agent | Full access to one agent (live mode) |
