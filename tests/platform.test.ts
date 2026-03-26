import { describe, expect, it, vi } from "vitest";
import { SpongePlatform } from "../src/platform.js";

describe("SpongePlatform", () => {
  it("creates and lists agents using a master key", async () => {
    const get = vi.fn().mockResolvedValue([
      {
        id: "7f24403f-9be0-40c0-90b7-b1e8b8760b10",
        name: "Agent One",
        description: null,
        status: "active",
        dailySpendingLimit: null,
        weeklySpendingLimit: null,
        monthlySpendingLimit: null,
        createdAt: "2026-03-25T00:00:00.000Z",
        updatedAt: "2026-03-25T00:00:00.000Z",
      },
    ]);
    const post = vi.fn().mockResolvedValue({
      agent: {
        id: "7f24403f-9be0-40c0-90b7-b1e8b8760b10",
        name: "Agent One",
        description: null,
        status: "active",
        dailySpendingLimit: null,
        weeklySpendingLimit: null,
        monthlySpendingLimit: null,
        createdAt: "2026-03-25T00:00:00.000Z",
        updatedAt: "2026-03-25T00:00:00.000Z",
      },
      mcpApiKey: "sponge_test_agent_123",
    });

    const platform = await SpongePlatform.connect({
      apiKey: "sponge_master_123",
    });
    (platform as any).http.get = get;
    (platform as any).http.post = post;
    (platform as any).agents = {
      list: async () => get(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const created = await platform.createAgent({
      name: "Agent One",
      isTestMode: true,
    });
    const agents = await platform.listAgents();

    expect(post).toHaveBeenCalledWith("/api/agents", {
      name: "Agent One",
      isTestMode: true,
    });
    expect(created.apiKey).toBe("sponge_test_agent_123");
    expect(agents).toHaveLength(1);
    expect(agents[0]?.name).toBe("Agent One");
  });

  it("manages master keys", async () => {
    const platform = await SpongePlatform.connect({
      apiKey: "sponge_master_123",
    });

    (platform as any).http.get = vi.fn().mockResolvedValue([
      {
        id: "b664bd0d-cf1c-4890-a2d8-e26d132e3ea4",
        keyPrefix: "sponge_master_abcd1234",
        keyName: "Platform Key",
        scopes: ["agents:create", "agents:read", "agents:delete"],
        isActive: true,
        usageCount: 2,
        lastUsedAt: "2026-03-25T00:00:00.000Z",
        expiresAt: null,
        createdAt: "2026-03-25T00:00:00.000Z",
      },
    ]);
    (platform as any).http.post = vi.fn().mockResolvedValue({
      id: "b664bd0d-cf1c-4890-a2d8-e26d132e3ea4",
      apiKey: "sponge_master_secret",
      keyName: "Platform Key",
      scopes: ["agents:create", "agents:read", "agents:delete"],
      createdAt: "2026-03-25T00:00:00.000Z",
    });
    (platform as any).http.delete = vi.fn().mockResolvedValue(undefined);

    const created = await platform.createMasterKey("Platform Key");
    const listed = await platform.listMasterKeys();
    await platform.revokeMasterKey("b664bd0d-cf1c-4890-a2d8-e26d132e3ea4");

    expect(created.apiKey).toBe("sponge_master_secret");
    expect(listed[0]?.keyPrefix).toBe("sponge_master_abcd1234");
    expect((platform as any).http.delete).toHaveBeenCalledWith(
      "/api/master-keys/b664bd0d-cf1c-4890-a2d8-e26d132e3ea4"
    );
  });

  it("sets spending limits across a fleet", async () => {
    const platform = await SpongePlatform.connect({
      apiKey: "sponge_master_123",
    });

    const update = vi
      .fn()
      .mockResolvedValueOnce({
        id: "7f24403f-9be0-40c0-90b7-b1e8b8760b10",
        name: "Agent One",
        description: null,
        status: "active",
        dailySpendingLimit: "100",
        weeklySpendingLimit: "500",
        monthlySpendingLimit: null,
        createdAt: "2026-03-25T00:00:00.000Z",
        updatedAt: "2026-03-25T00:00:00.000Z",
      })
      .mockRejectedValueOnce(new Error("agent update failed"));

    (platform as any).agents = {
      list: vi.fn().mockResolvedValue([
        {
          id: "7f24403f-9be0-40c0-90b7-b1e8b8760b10",
          name: "Agent One",
          description: null,
          status: "active",
          dailySpendingLimit: null,
          weeklySpendingLimit: null,
          monthlySpendingLimit: null,
          createdAt: "2026-03-25T00:00:00.000Z",
          updatedAt: "2026-03-25T00:00:00.000Z",
        },
        {
          id: "d50d5c4d-4987-4277-b5d2-f06f03f5ef88",
          name: "Agent Two",
          description: null,
          status: "active",
          dailySpendingLimit: null,
          weeklySpendingLimit: null,
          monthlySpendingLimit: null,
          createdAt: "2026-03-25T00:00:00.000Z",
          updatedAt: "2026-03-25T00:00:00.000Z",
        },
      ]),
      get: vi.fn(),
      update,
      delete: vi.fn(),
    };

    const result = await platform.setFleetSpendingLimits({
      dailySpendingLimit: "100",
      weeklySpendingLimit: "500",
    });

    expect((platform as any).agents.list).toHaveBeenCalled();
    expect(update).toHaveBeenNthCalledWith(1, "7f24403f-9be0-40c0-90b7-b1e8b8760b10", {
      dailySpendingLimit: "100",
      weeklySpendingLimit: "500",
      monthlySpendingLimit: undefined,
    });
    expect(update).toHaveBeenNthCalledWith(2, "d50d5c4d-4987-4277-b5d2-f06f03f5ef88", {
      dailySpendingLimit: "100",
      weeklySpendingLimit: "500",
      monthlySpendingLimit: undefined,
    });
    expect(result.updated).toHaveLength(1);
    expect(result.failed).toEqual([
      {
        agentId: "d50d5c4d-4987-4277-b5d2-f06f03f5ef88",
        error: "agent update failed",
      },
    ]);
  });

  it("sets spending limits for an explicit subset of agents", async () => {
    const platform = await SpongePlatform.connect({
      apiKey: "sponge_master_123",
    });

    const update = vi.fn().mockResolvedValue({
      id: "7f24403f-9be0-40c0-90b7-b1e8b8760b10",
      name: "Agent One",
      description: null,
      status: "active",
      dailySpendingLimit: null,
      weeklySpendingLimit: null,
      monthlySpendingLimit: "1500",
      createdAt: "2026-03-25T00:00:00.000Z",
      updatedAt: "2026-03-25T00:00:00.000Z",
    });

    (platform as any).agents = {
      list: vi.fn(),
      get: vi.fn(),
      update,
      delete: vi.fn(),
    };

    const result = await platform.setFleetSpendingLimits({
      agentIds: ["7f24403f-9be0-40c0-90b7-b1e8b8760b10"],
      monthlySpendingLimit: "1500",
    });

    expect((platform as any).agents.list).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith("7f24403f-9be0-40c0-90b7-b1e8b8760b10", {
      dailySpendingLimit: undefined,
      weeklySpendingLimit: undefined,
      monthlySpendingLimit: "1500",
    });
    expect(result.failed).toHaveLength(0);
    expect(result.updated).toHaveLength(1);
  });
});
