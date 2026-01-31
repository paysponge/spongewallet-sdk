/**
 * Master Key - Programmatic Agent Creation
 *
 * Uses a master API key to create new agents with wallets,
 * without requiring browser-based auth.
 *
 * Run with:
 *   cd packages/spongewallet-sdk
 *
 *   # Option A: authenticate via device flow to get a master key
 *   bun run examples/master-key.ts
 *
 *   # Option B: use an existing master key
 *   SPONGE_MASTER_KEY=sponge_master_xxx bun run examples/master-key.ts
 *
 * Optional:
 *   SPONGE_API_URL=http://localhost:8000 for local dev
 */

import { SpongeAdmin } from "../src/index.js";

async function main() {
  console.log("=".repeat(60));
  console.log("SpongeWallet SDK - Master Key Example");
  console.log("=".repeat(60));
  console.log();

  const baseUrl = process.env.SPONGE_API_URL || undefined;
  const masterKey = process.env.SPONGE_MASTER_KEY;

  let admin: SpongeAdmin;

  if (masterKey) {
    console.log("1. Using master key from environment...");
    admin = new SpongeAdmin({ apiKey: masterKey, baseUrl });
  } else {
    console.log("1. Authenticating via device flow to get master key...");
    admin = await SpongeAdmin.connect({ baseUrl });
  }
  console.log("   Done");
  console.log();

  // Create a new agent
  console.log("2. Creating agent...");
  const { agent, apiKey } = await admin.createAgent({
    name: `bot-${Date.now()}`,
    description: "Created via master key example",
  });
  console.log(`   Agent: ${agent.name} (${agent.id})`);
  console.log(`   API Key: ${apiKey.substring(0, 24)}...`);
  console.log();

  // Connect to the agent's wallet
  console.log("3. Connecting to agent wallet...");
  const wallet = await admin.createWallet({
    name: `wallet-bot-${Date.now()}`,
  });
  console.log(`   Connected! Agent ID: ${wallet.getAgentId()}`);
  console.log();

  // Get wallet addresses
  console.log("4. Getting wallet addresses...");
  const addresses = await wallet.getAddresses();
  for (const [chain, address] of Object.entries(addresses)) {
    console.log(`   ${chain}: ${address}`);
  }
  console.log();

  // List all agents
  console.log("5. Listing all agents...");
  const agents = await admin.listAgents();
  console.log(`   Total agents: ${agents.length}`);
  for (const a of agents) {
    console.log(`   - ${a.name} (${a.id})`);
  }
  console.log();

  console.log("=".repeat(60));
  console.log("Master key example completed!");
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
