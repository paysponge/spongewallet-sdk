import { z } from "zod";
import { AgentSchema, CreateAgentOptionsSchema, } from "../types/schemas.js";
// Response from creating an agent (includes API key)
const CreateAgentResponseSchema = z.object({
    agent: AgentSchema,
    mcpApiKey: z.string(),
});
export class AgentsApi {
    http;
    constructor(http) {
        this.http = http;
    }
    /**
     * Create a new agent
     */
    async create(options) {
        const validated = CreateAgentOptionsSchema.parse(options);
        const response = await this.http.post("/api/agents", validated);
        const parsed = CreateAgentResponseSchema.parse(response);
        return {
            agent: parsed.agent,
            apiKey: parsed.mcpApiKey,
        };
    }
    /**
     * List all agents for the current user
     * Note: This endpoint requires Privy auth, not API key auth
     */
    async list() {
        const response = await this.http.get("/api/agents");
        return z.array(AgentSchema).parse(response);
    }
    /**
     * Get a specific agent by ID
     * Note: This endpoint requires Privy auth, not API key auth
     */
    async get(agentId) {
        const response = await this.http.get(`/api/agents/${agentId}`);
        return AgentSchema.parse(response);
    }
    /**
     * Get the current agent (authenticated via API key)
     * This endpoint returns the agent associated with the current API key
     */
    async getCurrent() {
        const response = await this.http.get("/api/agents/me");
        return AgentSchema.parse(response);
    }
    /**
     * Update an agent
     */
    async update(agentId, updates) {
        const response = await this.http.put(`/api/agents/${agentId}`, updates);
        return AgentSchema.parse(response);
    }
    /**
     * Delete an agent
     */
    async delete(agentId) {
        await this.http.delete(`/api/agents/${agentId}`);
    }
}
//# sourceMappingURL=agents.js.map