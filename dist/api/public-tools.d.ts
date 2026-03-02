import { type Chain, type EvmTransferOptions, type SolanaTransferOptions, type SubmitTransaction, type DetailedBalances, type SolanaTokensResponse, type SolanaTokenSearchResponse, type FundingRequestResponse, type OnrampCryptoOptions, type OnrampCryptoResponse, type SignupBonusClaimResponse, type TransactionHistoryDetailed, type SpongeResponse, type X402PaymentResponse, type SolanaChain } from "../types/schemas.js";
import type { HttpClient } from "./http.js";
export interface DetailedBalanceOptions {
    chain?: Chain | "all";
    allowedChains?: Chain[];
    onlyUsdc?: boolean;
}
export interface TransactionHistoryDetailedOptions {
    limit?: number;
    chain?: Chain;
}
export interface FundingRequestOptions {
    amount: string;
    reason?: string;
    chain?: Chain;
    currency?: string;
}
export interface SpongeRequest {
    [key: string]: unknown;
}
export interface CreateX402PaymentOptions {
    chain: Chain;
    to: string;
    token?: string;
    amount: string;
    decimals?: number;
    valid_for_seconds?: number;
    resource_url?: string;
    resource_description?: string;
    fee_payer?: string;
    http_method?: "GET" | "POST";
}
export declare class PublicToolsApi {
    private readonly http;
    constructor(http: HttpClient);
    getDetailedBalances(options?: DetailedBalanceOptions): Promise<DetailedBalances>;
    evmTransfer(options: EvmTransferOptions): Promise<SubmitTransaction>;
    solanaTransfer(options: SolanaTransferOptions): Promise<SubmitTransaction>;
    getSolanaTokens(chain: SolanaChain): Promise<SolanaTokensResponse>;
    searchSolanaTokens(query: string, limit?: number): Promise<SolanaTokenSearchResponse>;
    getTransactionHistoryDetailed(options?: TransactionHistoryDetailedOptions): Promise<TransactionHistoryDetailed>;
    requestFunding(options: FundingRequestOptions): Promise<FundingRequestResponse>;
    createOnrampLink(options: OnrampCryptoOptions): Promise<OnrampCryptoResponse>;
    claimSignupBonus(): Promise<SignupBonusClaimResponse>;
    sponge(request: SpongeRequest): Promise<SpongeResponse>;
    createX402Payment(options: CreateX402PaymentOptions): Promise<X402PaymentResponse>;
}
//# sourceMappingURL=public-tools.d.ts.map