import { describe, expect, it, vi } from "vitest";
import { PublicToolsApi } from "../src/api/public-tools.js";

describe("PublicToolsApi", () => {
  it("builds balance query params", async () => {
    const http = {
      get: vi.fn().mockResolvedValue({}),
      post: vi.fn(),
    };
    const api = new PublicToolsApi(http as any);

    await api.getDetailedBalances({
      chain: "base",
      allowedChains: ["base", "solana"],
      onlyUsdc: true,
    });

    expect(http.get).toHaveBeenCalledWith("/api/balances", {
      chain: "base",
      allowedChains: "base,solana",
      onlyUsdc: "true",
    });
  });

  it("posts evm transfers to the REST endpoint", async () => {
    const http = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue({
        transactionHash: "0xabc",
        status: "pending",
        explorerUrl: "https://example.com/tx/0xabc",
      }),
    };
    const api = new PublicToolsApi(http as any);

    const result = await api.evmTransfer({
      chain: "base",
      to: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
      amount: "1",
      currency: "USDC",
    });

    expect(result.transactionHash).toBe("0xabc");
    expect(http.post).toHaveBeenCalledWith("/api/transfers/evm", {
      chain: "base",
      to: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
      amount: "1",
      currency: "USDC",
    });
  });
});
