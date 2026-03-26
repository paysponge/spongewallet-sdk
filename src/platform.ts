import { z } from "zod";
import { getApiKey } from "./auth/credentials.js";
import { AgentsApi } from "./api/agents.js";
import { HttpClient, SpongeApiError } from "./api/http.js";
import { SpongeWallet } from "./client.js";
import {
  AgentSchema,
  BridgeCreateExternalAccountOptionsSchema,
  BridgeCreateKycLinkOptionsSchema,
  BridgeCreateTransferOptionsSchema,
  BridgeCustomerSchema,
  BridgeExternalAccountSchema,
  BridgeKycLinkResponseSchema,
  BridgeTransferSchema,
  BridgeVirtualAccountSchema,
  CreatedMasterApiKeySchema,
  MasterApiKeySchema,
  PlatformConnectOptionsSchema,
  PlatformCreateAgentOptionsSchema,
  PlatformFleetSpendingLimitOptionsSchema,
  type Agent,
  type BridgeCreateExternalAccountOptions,
  type BridgeCreateKycLinkOptions,
  type BridgeCreateTransferOptions,
  type BridgeCustomer,
  type BridgeExternalAccount,
  type BridgeKycLinkResponse,
  type BridgeTransfer,
  type BridgeVirtualAccount,
  type CreatedMasterApiKey,
  type MasterApiKey,
  type PlatformConnectOptions,
  type PlatformCreateAgentOptions,
  type PlatformFleetSpendingLimitOptions,
  type PlatformFleetSpendingLimitResult,
} from "./types/schemas.js";

const DEFAULT_BASE_URL = "https://api.wallet.paysponge.com";

const CreateAgentResponseSchema = z.object({
  agent: AgentSchema,
  mcpApiKey: z.string(),
});

const AgentApiKeyResponseSchema = z.object({
  mcpApiKey: z.string().nullable(),
});

const BridgeCustomerLookupSchema = z.object({
  id: z.string().optional(),
  kycStatus: z.string().nullable().optional(),
  tosStatus: z.string().nullable().optional(),
});

export class SpongePlatform {
  private readonly http: HttpClient;
  private readonly agents: AgentsApi;
  private readonly baseUrl: string;

  private constructor(options: { apiKey: string; baseUrl?: string }) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.http = new HttpClient({
      apiKey: options.apiKey,
      baseUrl: this.baseUrl,
    });
    this.agents = new AgentsApi(this.http);
  }

  static async connect(options: PlatformConnectOptions = {}): Promise<SpongePlatform> {
    const validated = PlatformConnectOptionsSchema.parse(options);
    const apiKey = validated.apiKey ?? getApiKey("SPONGE_MASTER_KEY");

    if (!apiKey) {
      throw new Error(
        "Missing master API key. Pass apiKey to SpongePlatform.connect() or set SPONGE_MASTER_KEY."
      );
    }

    return new SpongePlatform({
      apiKey,
      baseUrl: validated.baseUrl,
    });
  }

  async createAgent(
    options: PlatformCreateAgentOptions
  ): Promise<{ agent: Agent; apiKey: string }> {
    const validated = PlatformCreateAgentOptionsSchema.parse(options);
    const response = await this.http.post("/api/agents", validated);
    const parsed = CreateAgentResponseSchema.parse(response);

    return {
      agent: parsed.agent,
      apiKey: parsed.mcpApiKey,
    };
  }

  async listAgents(): Promise<Agent[]> {
    return this.agents.list();
  }

  async getAgent(agentId: string): Promise<Agent> {
    return this.agents.get(agentId);
  }

  async updateAgent(
    agentId: string,
    updates: Partial<PlatformCreateAgentOptions>
  ): Promise<Agent> {
    return this.agents.update(agentId, updates);
  }

  async setFleetSpendingLimits(
    options: PlatformFleetSpendingLimitOptions
  ): Promise<PlatformFleetSpendingLimitResult> {
    const validated = PlatformFleetSpendingLimitOptionsSchema.parse(options);
    const targetAgentIds = validated.agentIds
      ?? (await this.listAgents()).map((agent) => agent.id);

    const updates = {
      dailySpendingLimit: validated.dailySpendingLimit,
      weeklySpendingLimit: validated.weeklySpendingLimit,
      monthlySpendingLimit: validated.monthlySpendingLimit,
    };

    const settled = await Promise.all(
      targetAgentIds.map(async (agentId) => {
        try {
          const agent = await this.updateAgent(agentId, updates);
          return { ok: true as const, agent };
        } catch (error) {
          return {
            ok: false as const,
            agentId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    return {
      updated: settled
        .filter((result): result is { ok: true; agent: Agent } => result.ok)
        .map((result) => result.agent),
      failed: settled
        .filter(
          (result): result is { ok: false; agentId: string; error: string } =>
            !result.ok
        )
        .map((result) => ({
          agentId: result.agentId,
          error: result.error,
        })),
    };
  }

  async deleteAgent(agentId: string): Promise<void> {
    return this.agents.delete(agentId);
  }

  async getAgentApiKey(agentId: string, isTestMode = true): Promise<string | null> {
    const response = await this.http.get("/api/agents/" + encodeURIComponent(agentId) + "/api-key", {
      isTestMode: String(isTestMode),
    });
    return AgentApiKeyResponseSchema.parse(response).mcpApiKey;
  }

  async regenerateAgentApiKey(agentId: string, isTestMode = true): Promise<string> {
    const response = await this.http.post("/api/agents/" + encodeURIComponent(agentId) + "/regenerate-key", {
      isTestMode,
    });
    return z.object({ mcpApiKey: z.string() }).parse(response).mcpApiKey;
  }

  async listMasterKeys(): Promise<MasterApiKey[]> {
    const response = await this.http.get("/api/master-keys/");
    return z.array(MasterApiKeySchema).parse(response);
  }

  async createMasterKey(name?: string): Promise<CreatedMasterApiKey> {
    const response = await this.http.post("/api/master-keys/", {
      name,
    });
    return CreatedMasterApiKeySchema.parse(response);
  }

  async revokeMasterKey(id: string): Promise<void> {
    await this.http.delete("/api/master-keys/" + encodeURIComponent(id));
  }

  async getBridgeCustomer(forceRefresh = false): Promise<BridgeCustomer | null> {
    const response = await this.http.get("/api/bridge-fiat/customer", {
      forceRefresh: forceRefresh ? "true" : undefined,
    });
    const parsed = BridgeCustomerLookupSchema.parse(response);

    if (!parsed.id) {
      return null;
    }

    return BridgeCustomerSchema.parse(response);
  }

  async createBridgeKycLink(
    options: BridgeCreateKycLinkOptions = {}
  ): Promise<BridgeKycLinkResponse> {
    const validated = BridgeCreateKycLinkOptionsSchema.parse(options);
    const response = await this.http.post("/api/bridge-fiat/customer/kyc-link", validated);
    return BridgeKycLinkResponseSchema.parse(response);
  }

  async listBridgeExternalAccounts(): Promise<BridgeExternalAccount[]> {
    const response = await this.http.get("/api/bridge-fiat/external-accounts");
    return z.array(BridgeExternalAccountSchema).parse(response);
  }

  async createBridgeExternalAccount(
    options: BridgeCreateExternalAccountOptions
  ): Promise<BridgeExternalAccount> {
    const validated = BridgeCreateExternalAccountOptionsSchema.parse(options);
    const response = await this.http.post("/api/bridge-fiat/external-accounts", validated);
    return BridgeExternalAccountSchema.parse(response);
  }

  async getBridgeVirtualAccount(walletId: string): Promise<BridgeVirtualAccount | null> {
    try {
      const response = await this.http.get(
        "/api/bridge-fiat/wallets/" + encodeURIComponent(walletId) + "/virtual-account"
      );
      return BridgeVirtualAccountSchema.parse(response);
    } catch (error) {
      if (error instanceof SpongeApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async createBridgeVirtualAccount(walletId: string): Promise<BridgeVirtualAccount> {
    const response = await this.http.post(
      "/api/bridge-fiat/wallets/" + encodeURIComponent(walletId) + "/virtual-account"
    );
    return BridgeVirtualAccountSchema.parse(response);
  }

  async listBridgeTransfers(transferId?: string): Promise<BridgeTransfer[]> {
    const response = await this.http.get("/api/bridge-fiat/transfers", {
      transferId,
    });
    return z.array(BridgeTransferSchema).parse(response);
  }

  async createBridgeTransfer(
    options: BridgeCreateTransferOptions
  ): Promise<BridgeTransfer> {
    const validated = BridgeCreateTransferOptionsSchema.parse(options);
    const response = await this.http.post("/api/bridge-fiat/transfers", validated);
    return BridgeTransferSchema.parse(response);
  }

  async connectAgent(options: { apiKey: string; agentId?: string }): Promise<SpongeWallet> {
    return SpongeWallet.connect({
      apiKey: options.apiKey,
      agentId: options.agentId,
      baseUrl: this.baseUrl,
    });
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
