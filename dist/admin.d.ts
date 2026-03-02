import { type Agent, type CreateAgentOptions } from "./types/schemas.js";
import { SpongeWallet } from "./client.js";
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
export declare class SpongeAdmin {
    private readonly http;
    private readonly agents;
    private readonly baseUrl;
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
    static connect(options?: {
        baseUrl?: string;
        noBrowser?: boolean;
    }): Promise<SpongeAdmin>;
    constructor(options: {
        apiKey: string;
        baseUrl?: string;
    });
    /**
     * Create a new agent with wallets
     *
     * Returns the agent and its API key. The API key can be used
     * with `SpongeWallet.connect()` to interact with the agent's wallets.
     */
    createAgent(options: CreateAgentOptions): Promise<{
        agent: Agent;
        apiKey: string;
    }>;
    /**
     * List all agents for this user
     */
    listAgents(): Promise<Agent[]>;
    /**
     * Delete an agent
     */
    deleteAgent(agentId: string): Promise<void>;
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
    createWallet(options: CreateAgentOptions): Promise<SpongeWallet>;
}
//# sourceMappingURL=admin.d.ts.map