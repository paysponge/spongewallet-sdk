import { type Agent, type CreateAgentOptions } from "../types/schemas.js";
import type { HttpClient } from "./http.js";
export declare class AgentsApi {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Create a new agent
     */
    create(options: CreateAgentOptions): Promise<{
        agent: Agent;
        apiKey: string;
    }>;
    /**
     * List all agents for the current user
     * Note: This endpoint requires Privy auth, not API key auth
     */
    list(): Promise<Agent[]>;
    /**
     * Get a specific agent by ID
     * Note: This endpoint requires Privy auth, not API key auth
     */
    get(agentId: string): Promise<Agent>;
    /**
     * Get the current agent (authenticated via API key)
     * This endpoint returns the agent associated with the current API key
     */
    getCurrent(): Promise<Agent>;
    /**
     * Update an agent
     */
    update(agentId: string, updates: Partial<CreateAgentOptions>): Promise<Agent>;
    /**
     * Delete an agent
     */
    delete(agentId: string): Promise<void>;
}
//# sourceMappingURL=agents.d.ts.map