import { describe, expect, it, vi } from "vitest";
import { ToolExecutor } from "../src/tools/executor.js";

describe("ToolExecutor", () => {
  it("routes get_balance to /api/balances", async () => {
    const http = {
      get: vi.fn().mockResolvedValue({}),
      post: vi.fn(),
    };
    const executor = new ToolExecutor(http as any, "agent-1");

    const result = await executor.execute("get_balance", {
      chain: "base",
      allowedChains: ["base", "solana"],
      onlyUsdc: true,
    });

    expect(result.status).toBe("success");
    expect(http.get).toHaveBeenCalledWith("/api/balances", {
      chain: "base",
      allowedChains: "base,solana",
      onlyUsdc: "true",
    });
  });

  it("returns error when transaction status lacks chain", async () => {
    const http = {
      get: vi.fn(),
      post: vi.fn(),
    };
    const executor = new ToolExecutor(http as any, "agent-1");

    const result = await executor.execute("get_transaction_status", {
      txHash: "0xabc",
    });

    expect(result.status).toBe("error");
  });
});
