import {
  type Agent,
  type CreateAgentOptions,
  CreateAgentOptionsSchema,
} from "./types/schemas.js";
import { HttpClient } from "./api/http.js";
import { AgentsApi } from "./api/agents.js";
import { SpongeWallet } from "./client.js";
import { deviceFlowAuth } from "./auth/device-flow.js";

const DEFAULT_BASE_URL = "https://api.wallet.paysponge.com";

/**
 * SpongeAdmin - Management client for programmatic agent creation
 *
 * Use a master API key to create and manage agents without browser-based auth.
 * Generate one via `SpongeAdmin.connect()` (device flow) or the dashboard.
 *
 * @example
 * ```typescript
 * import { SpongeAdmin } from '@spongewallet/sdk';
 *
 * // First time: authenticate via browser to get a master key
 * const admin = await SpongeAdmin.connect();
 *
 * // Or use an existing master key
 * const admin = new SpongeAdmin({ apiKey: 'sponge_master_...' });
 *
 * // Create a new agent with wallets
 * const { agent, apiKey } = await admin.createAgent({ name: 'trading-bot-1' });
 *
 * // Connect to the agent's wallet
 * const wallet = await SpongeWallet.connect({ apiKey });
 * ```
 */
export class SpongeAdmin {
  private readonly http: HttpClient;
  private readonly agents: AgentsApi;
  private readonly baseUrl: string;

  /**
   * Authenticate via device flow and get a master API key
   *
   * Opens a browser for login, then returns a SpongeAdmin instance
   * with a master key that can create agents programmatically.
   *
   * @example
   * ```typescript
   * const admin = await SpongeAdmin.connect();
   * const { agent, apiKey } = await admin.createAgent({ name: 'my-bot' });
   * ```
   */
  static async connect(options: {
    baseUrl?: string;
    noBrowser?: boolean;
  } = {}): Promise<SpongeAdmin> {
    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

    const tokenResponse = await deviceFlowAuth({
      baseUrl,
      noBrowser: options.noBrowser,
      keyType: "master",
    });

    return new SpongeAdmin({
      apiKey: tokenResponse.apiKey,
      baseUrl,
    });
  }

  constructor(options: { apiKey: string; baseUrl?: string }) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.http = new HttpClient({
      baseUrl: this.baseUrl,
      apiKey: options.apiKey,
    });
    this.agents = new AgentsApi(this.http);
  }

  /**
   * Create a new agent with wallets
   *
   * Returns the agent and its API key. The API key can be used
   * with `SpongeWallet.connect()` to interact with the agent's wallets.
   */
  async createAgent(
    options: CreateAgentOptions
  ): Promise<{ agent: Agent; apiKey: string }> {
    const validated = CreateAgentOptionsSchema.parse(options);
    return this.agents.create(validated);
  }

  /**
   * List all agents for this user
   */
  async listAgents(): Promise<Agent[]> {
    return this.agents.list();
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    return this.agents.delete(agentId);
  }

  /**
   * Create a new agent and return a connected SpongeWallet instance
   *
   * Convenience method that combines `createAgent` + `SpongeWallet.connect`.
   *
   * @example
   * ```typescript
   * const wallet = await admin.createWallet({ name: 'my-agent' });
   * const balances = await wallet.getBalances();
   * ```
   */
  async createWallet(options: CreateAgentOptions): Promise<SpongeWallet> {
    const { apiKey, agent } = await this.createAgent(options);
    return SpongeWallet.connect({
      apiKey,
      agentId: agent.id,
      baseUrl: this.baseUrl !== DEFAULT_BASE_URL ? this.baseUrl : undefined,
    });
  }
}
