import { type TransactionResult, type TransactionStatus, type TransferOptions, type SwapOptions, type Chain } from "../types/schemas.js";
import type { HttpClient } from "./http.js";
export declare class TransactionsApi {
    private readonly http;
    private readonly agentId;
    constructor(http: HttpClient, agentId: string);
    /**
     * Transfer tokens (EVM or Solana)
     * Uses the /api/transactions/transfer endpoint
     */
    transfer(options: TransferOptions): Promise<TransactionResult>;
    /**
     * Swap tokens (Solana via Jupiter)
     * Uses the /api/transactions/swap endpoint
     */
    swap(options: SwapOptions): Promise<TransactionResult>;
    /**
     * Get transaction status
     * Uses the /api/transactions/status/:txHash endpoint
     */
    getStatus(txHash: string, chain: Chain): Promise<TransactionStatus>;
    /**
     * Get transaction history
     */
    getHistory(options?: {
        limit?: number;
        offset?: number;
    }): Promise<TransactionStatus[]>;
}
//# sourceMappingURL=transactions.d.ts.map