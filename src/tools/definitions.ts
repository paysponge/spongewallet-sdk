/**
 * Tool definitions for use with the Anthropic SDK
 *
 * These definitions follow the Anthropic tool schema format
 */

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "get_balance",
    description:
      "Get the balance of your wallet. Returns balances for native tokens and USDC across all supported chains.",
    input_schema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          enum: [
            "ethereum",
            "base",
            "sepolia",
            "base-sepolia",
            "tempo",
            "solana",
            "solana-devnet",
          ],
          description:
            "Optional: Specific chain to check balance for. If not provided, returns balances for all chains.",
        },
        allowedChains: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional: Restrict balance results to these chains (e.g., ['base','solana'])",
        },
        onlyUsdc: {
          type: "boolean",
          description: "Optional: Only return USDC balances",
        },
      },
      required: [],
    },
  },
  {
    name: "evm_transfer",
    description:
      "Transfer ETH or USDC on Ethereum, Base, or their testnets. Supports native ETH and USDC transfers.",
    input_schema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          enum: ["ethereum", "base", "sepolia", "base-sepolia"],
          description: "The chain to transfer on",
        },
        to: {
          type: "string",
          description: "The recipient address (0x...)",
        },
        amount: {
          type: "string",
          description:
            "The amount to transfer (e.g., '0.1' for 0.1 ETH or '100' for 100 USDC)",
        },
        currency: {
          type: "string",
          enum: ["ETH", "USDC"],
          description: "The currency to transfer",
        },
      },
      required: ["chain", "to", "amount", "currency"],
    },
  },
  {
    name: "solana_transfer",
    description:
      "Transfer SOL or USDC on Solana mainnet or devnet. Supports native SOL and USDC transfers.",
    input_schema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          enum: ["solana", "solana-devnet"],
          description: "The Solana network to use",
        },
        to: {
          type: "string",
          description: "The recipient address",
        },
        amount: {
          type: "string",
          description: "The amount to transfer",
        },
        currency: {
          type: "string",
          enum: ["SOL", "USDC"],
          description: "The currency to transfer",
        },
      },
      required: ["chain", "to", "amount", "currency"],
    },
  },
  {
    name: "solana_swap",
    description:
      "Swap tokens on Solana using Jupiter aggregator. Finds the best route and executes the swap.",
    input_schema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          enum: ["solana", "solana-devnet"],
          description: "The Solana network to use",
        },
        inputToken: {
          type: "string",
          description:
            "The token to swap from (symbol like 'SOL', 'USDC', or token address)",
        },
        outputToken: {
          type: "string",
          description:
            "The token to swap to (symbol like 'SOL', 'USDC', or token address)",
        },
        amount: {
          type: "string",
          description: "The amount of input token to swap",
        },
        slippageBps: {
          type: "number",
          description:
            "Slippage tolerance in basis points (default: 50 = 0.5%)",
        },
      },
      required: ["chain", "inputToken", "outputToken", "amount"],
    },
  },
  {
    name: "get_solana_tokens",
    description:
      "List all SPL tokens held by the agent's Solana wallet, with balances and metadata.",
    input_schema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          enum: ["solana", "solana-devnet"],
          description: "The Solana network to use",
        },
      },
      required: ["chain"],
    },
  },
  {
    name: "search_solana_tokens",
    description: "Search the Jupiter token list by symbol or name.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (symbol or name)",
        },
        limit: {
          type: "number",
          description: "Max results (default 10, max 20)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_transaction_status",
    description: "Check the status of a transaction by its hash/signature.",
    input_schema: {
      type: "object",
      properties: {
        txHash: {
          type: "string",
          description: "The transaction hash (EVM) or signature (Solana)",
        },
        chain: {
          type: "string",
          enum: [
            "ethereum",
            "base",
            "sepolia",
            "base-sepolia",
            "tempo",
            "solana",
            "solana-devnet",
          ],
          description: "Chain for the transaction",
        },
      },
      required: ["txHash", "chain"],
    },
  },
  {
    name: "get_transaction_history",
    description: "Get recent transaction history for this agent's wallets.",
    input_schema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of transactions to return (default: 50)",
        },
        chain: {
          type: "string",
          description: "Optional: filter by chain",
        },
      },
      required: [],
    },
  },
  {
    name: "request_funding",
    description:
      "Request funding from the owner (creates an approval request).",
    input_schema: {
      type: "object",
      properties: {
        amount: {
          type: "string",
          description: "Amount to request",
        },
        reason: {
          type: "string",
          description: "Reason for the request",
        },
        chain: {
          type: "string",
          description: "Chain to request on (default: tempo)",
        },
        currency: {
          type: "string",
          description: "Currency (pathUSD, USDC, ETH, SOL)",
        },
      },
      required: ["amount"],
    },
  },
  {
    name: "withdraw_to_main_wallet",
    description: "Withdraw funds back to the owner's main wallet.",
    input_schema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          enum: [
            "ethereum",
            "base",
            "sepolia",
            "base-sepolia",
            "tempo",
            "solana",
            "solana-devnet",
          ],
          description: "Chain to withdraw from",
        },
        amount: {
          type: "string",
          description: "Amount to withdraw",
        },
        currency: {
          type: "string",
          enum: ["native", "USDC"],
          description: "Token to withdraw (default: native)",
        },
      },
      required: ["chain", "amount"],
    },
  },
  // x402 paid API tools - temporarily disabled
  // {
  //   name: "sponge",
  //   description:
  //     "Call paid APIs via x402 (search, image, predict, crawl, parse, prospect, llm).",
  //   input_schema: {
  //     type: "object",
  //     properties: {
  //       task: {
  //         type: "string",
  //         description: "Task name (search, image, predict, crawl, parse, prospect, llm)",
  //       },
  //     },
  //     required: ["task"],
  //   },
  // },
  // {
  //   name: "create_x402_payment",
  //   description: "Create a signed x402 payment payload.",
  //   input_schema: {
  //     type: "object",
  //     properties: {
  //       chain: {
  //         type: "string",
  //         description: "Chain to pay on (e.g., base, solana, tempo)",
  //       },
  //       to: {
  //         type: "string",
  //         description: "Recipient address from 402 response",
  //       },
  //       token: {
  //         type: "string",
  //         description: "Token address or mint (optional)",
  //       },
  //       amount: {
  //         type: "string",
  //         description: "Amount to pay",
  //       },
  //       decimals: {
  //         type: "number",
  //         description: "Token decimals (optional)",
  //       },
  //       valid_for_seconds: {
  //         type: "number",
  //         description: "Payment validity window in seconds",
  //       },
  //       resource_url: {
  //         type: "string",
  //         description: "Resource URL for x402 preflight or metadata",
  //       },
  //       resource_description: {
  //         type: "string",
  //         description: "Resource description",
  //       },
  //       fee_payer: {
  //         type: "string",
  //         description: "Solana fee payer from 402 response (optional)",
  //       },
  //       http_method: {
  //         type: "string",
  //         enum: ["GET", "POST"],
  //         description: "HTTP method used for 402 preflight (default: GET)",
  //       },
  //     },
  //     required: ["chain", "to", "amount"],
  //   },
  // },
];
