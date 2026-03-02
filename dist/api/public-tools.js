import { DetailedBalancesSchema, EvmTransferOptionsSchema, SolanaTransferOptionsSchema, SubmitTransactionSchema, SolanaTokensResponseSchema, SolanaTokenSearchResponseSchema, FundingRequestResponseSchema, OnrampCryptoOptionsSchema, OnrampCryptoResponseSchema, SignupBonusClaimResponseSchema, TransactionHistoryDetailedSchema, SpongeResponseSchema, X402PaymentResponseSchema, } from "../types/schemas.js";
export class PublicToolsApi {
    http;
    constructor(http) {
        this.http = http;
    }
    async getDetailedBalances(options = {}) {
        const params = {};
        if (options.chain) {
            params.chain = options.chain;
        }
        if (options.allowedChains?.length) {
            params.allowedChains = options.allowedChains.join(",");
        }
        if (options.onlyUsdc) {
            params.onlyUsdc = "true";
        }
        const response = await this.http.get("/api/balances", params);
        return DetailedBalancesSchema.parse(response);
    }
    async evmTransfer(options) {
        const validated = EvmTransferOptionsSchema.parse(options);
        const response = await this.http.post("/api/transfers/evm", validated);
        return SubmitTransactionSchema.parse(response);
    }
    async solanaTransfer(options) {
        const validated = SolanaTransferOptionsSchema.parse(options);
        const response = await this.http.post("/api/transfers/solana", validated);
        return SubmitTransactionSchema.parse(response);
    }
    async getSolanaTokens(chain) {
        const response = await this.http.get("/api/solana/tokens", { chain });
        return SolanaTokensResponseSchema.parse(response);
    }
    async searchSolanaTokens(query, limit) {
        const params = { query };
        if (limit !== undefined)
            params.limit = limit.toString();
        const response = await this.http.get("/api/solana/tokens/search", params);
        return SolanaTokenSearchResponseSchema.parse(response);
    }
    async getTransactionHistoryDetailed(options = {}) {
        const params = {};
        if (options.limit !== undefined)
            params.limit = options.limit.toString();
        if (options.chain)
            params.chain = options.chain;
        const response = await this.http.get("/api/transactions/history", params);
        return TransactionHistoryDetailedSchema.parse(response);
    }
    async requestFunding(options) {
        const response = await this.http.post("/api/funding-requests", options);
        return FundingRequestResponseSchema.parse(response);
    }
    async createOnrampLink(options) {
        const validated = OnrampCryptoOptionsSchema.parse(options);
        const response = await this.http.post("/api/onramp/crypto", validated);
        return OnrampCryptoResponseSchema.parse(response);
    }
    async claimSignupBonus() {
        const response = await this.http.post("/api/signup-bonus/claim", {});
        return SignupBonusClaimResponseSchema.parse(response);
    }
    async sponge(request) {
        const response = await this.http.post("/api/sponge", request);
        return SpongeResponseSchema.parse(response);
    }
    async createX402Payment(options) {
        const response = await this.http.post("/api/x402/payments", options);
        return X402PaymentResponseSchema.parse(response);
    }
}
//# sourceMappingURL=public-tools.js.map