import { z } from "zod";
import type { HttpClient } from "../api/http.js";
import type { ToolResult } from "../types/schemas.js";
import { TOOL_DEFINITIONS, type ToolDefinition } from "./definitions.js";

/**
 * Tool executor for use with the Anthropic SDK
 *
 * Provides tool definitions and an execute method to run tools
 */
export class ToolExecutor {
  constructor(
    private readonly http: HttpClient,
    private readonly agentId: string
  ) {}

  /**
   * Get tool definitions for use with Anthropic SDK
   */
  get definitions(): ToolDefinition[] {
    return TOOL_DEFINITIONS;
  }

  /**
   * Execute a tool by name
   *
   * @param name - Tool name
   * @param input - Tool input
   * @returns Tool result
   *
   * @example
   * ```typescript
   * const tools = wallet.tools();
   *
   * const response = await anthropic.messages.create({
   *   model: 'claude-sonnet-4-20250514',
   *   tools: tools.definitions,
   *   messages: [{ role: 'user', content: 'Check balance' }],
   * });
   *
   * for (const block of response.content) {
   *   if (block.type === 'tool_use') {
   *     const result = await tools.execute(block.name, block.input);
   *     console.log(result);
   *   }
   * }
   * ```
   */
  async execute(name: string, input: unknown): Promise<ToolResult> {
    try {
      const result = await this.callTool(name, input);
      return {
        status: "success",
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Call the MCP tool endpoint
   */
  private async callTool(name: string, input: unknown): Promise<unknown> {
    // Validate tool name
    const tool = TOOL_DEFINITIONS.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    const args = z.record(z.unknown()).parse(input ?? {});

    switch (name) {
      case "get_balance": {
        const allowedChains = Array.isArray(args.allowedChains)
          ? (args.allowedChains as unknown[]).map(String).join(",")
          : typeof args.allowedChains === "string"
            ? args.allowedChains
            : undefined;
        const params: Record<string, string> = {
          chain: (args.chain as string | undefined) ?? "all",
        };
        if (allowedChains) params.allowedChains = allowedChains;
        if (args.onlyUsdc) params.onlyUsdc = "true";
        return this.http.get<unknown>("/api/balances", params);
      }
      case "evm_transfer":
        return this.http.post<unknown>("/api/transfers/evm", {
          chain: args.chain,
          to: args.to,
          amount: args.amount,
          currency: args.currency,
        });
      case "solana_transfer":
        return this.http.post<unknown>("/api/transfers/solana", {
          chain: args.chain,
          to: args.to,
          amount: args.amount,
          currency: args.currency,
        });
      case "solana_swap":
        return this.http.post<unknown>("/api/transactions/swap", {
          chain: args.chain,
          inputToken: args.inputToken ?? args.input_token,
          outputToken: args.outputToken ?? args.output_token,
          amount: args.amount,
          slippageBps: args.slippageBps ?? args.slippage_bps,
        });
      case "get_solana_tokens":
        return this.http.get<unknown>("/api/solana/tokens", {
          chain: String(args.chain ?? ""),
        });
      case "search_solana_tokens": {
        const searchParams: Record<string, string> = {
          query: String(args.query ?? ""),
        };
        if (args.limit !== undefined) searchParams.limit = String(args.limit);
        return this.http.get<unknown>("/api/solana/tokens/search", searchParams);
      }
      case "get_transaction_status": {
        const txHash = (args.txHash ?? args.transaction_hash) as string;
        if (!txHash) {
          throw new Error("txHash is required");
        }
        if (!args.chain) {
          throw new Error("chain is required");
        }
        return this.http.get<unknown>(
          `/api/transactions/status/${encodeURIComponent(txHash)}`,
          { chain: String(args.chain) },
        );
      }
      case "get_transaction_history": {
        const historyParams: Record<string, string> = {};
        if (args.limit !== undefined) historyParams.limit = String(args.limit);
        if (args.chain) historyParams.chain = String(args.chain);
        return this.http.get<unknown>("/api/transactions/history", historyParams);
      }
      case "request_funding":
        return this.http.post<unknown>("/api/funding-requests", {
          amount: args.amount,
          reason: args.reason,
          chain: args.chain,
          currency: args.currency,
        });
      case "withdraw_to_main_wallet":
        return this.http.post<unknown>("/api/wallets/withdraw-to-main", {
          chain: args.chain,
          amount: args.amount,
          currency: args.currency,
        });
      case "sponge":
        return this.http.post<unknown>("/api/sponge", args);
      case "create_x402_payment":
        return this.http.post<unknown>("/api/x402/payments", {
          chain: args.chain,
          to: args.to,
          token: args.token,
          amount: args.amount,
          decimals: args.decimals,
          valid_for_seconds: args.valid_for_seconds,
          resource_url: args.resource_url,
          resource_description: args.resource_description,
          fee_payer: args.fee_payer,
          http_method: args.http_method,
        });
      default:
        throw new Error(`Tool not implemented: ${name}`);
    }
  }
}

/**
 * Create a tool executor for use with the Anthropic SDK
 *
 * @param http - HTTP client instance
 * @param agentId - Agent ID
 * @returns Tool executor with definitions and execute method
 */
export function createTools(http: HttpClient, agentId: string): ToolExecutor {
  return new ToolExecutor(http, agentId);
}
