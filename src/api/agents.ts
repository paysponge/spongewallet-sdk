import { z } from "zod";
import {
  AgentSchema,
  CreateAgentOptionsSchema,
  type Agent,
  type CreateAgentOptions,
} from "../types/schemas.js";
import type { HttpClient } from "./http.js";

// Response from creating an agent (includes API key)
const CreateAgentResponseSchema = z.object({
  agent: AgentSchema,
  mcpApiKey: z.string(),
});

export class AgentsApi {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new agent
   */
  async create(
    options: CreateAgentOptions
  ): Promise<{ agent: Agent; apiKey: string }> {
    const validated = CreateAgentOptionsSchema.parse(options);

    const response = await this.http.post<unknown>("/api/agents", validated);
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
  async list(): Promise<Agent[]> {
    const response = await this.http.get<unknown[]>("/api/agents");
    return z.array(AgentSchema).parse(response);
  }

  /**
   * Get a specific agent by ID
   * Note: This endpoint requires Privy auth, not API key auth
   */
  async get(agentId: string): Promise<Agent> {
    const response = await this.http.get<unknown>(`/api/agents/${agentId}`);
    return AgentSchema.parse(response);
  }

  /**
   * Get the current agent (authenticated via API key)
   * This endpoint returns the agent associated with the current API key
   */
  async getCurrent(): Promise<Agent> {
    const response = await this.http.get<unknown>("/api/agents/me");
    return AgentSchema.parse(response);
  }

  /**
   * Update an agent
   */
  async update(
    agentId: string,
    updates: Partial<CreateAgentOptions>
  ): Promise<Agent> {
    const response = await this.http.put<unknown>(
      `/api/agents/${agentId}`,
      updates
    );
    return AgentSchema.parse(response);
  }

  /**
   * Delete an agent
   */
  async delete(agentId: string): Promise<void> {
    await this.http.delete(`/api/agents/${agentId}`);
  }
}
