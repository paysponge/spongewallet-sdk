import {
  DetailedBalancesSchema,
  EvmTransferOptionsSchema,
  SolanaTransferOptionsSchema,
  SubmitTransactionSchema,
  SolanaTokensResponseSchema,
  SolanaTokenSearchResponseSchema,
  FundingRequestResponseSchema,
  OnrampCryptoOptionsSchema,
  OnrampCryptoResponseSchema,
  SignupBonusClaimResponseSchema,
  TransactionHistoryDetailedSchema,
  SpongeResponseSchema,
  X402PaymentResponseSchema,
  type Chain,
  type EvmTransferOptions,
  type SolanaTransferOptions,
  type SubmitTransaction,
  type DetailedBalances,
  type SolanaTokensResponse,
  type SolanaTokenSearchResponse,
  type FundingRequestResponse,
  type OnrampCryptoOptions,
  type OnrampCryptoResponse,
  type SignupBonusClaimResponse,
  type TransactionHistoryDetailed,
  type SpongeResponse,
  type X402PaymentResponse,
  type SolanaChain,
} from "../types/schemas.js";
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

export class PublicToolsApi {
  constructor(private readonly http: HttpClient) {}

  async getDetailedBalances(options: DetailedBalanceOptions = {}): Promise<DetailedBalances> {
    const params: Record<string, string> = {};
    if (options.chain) {
      params.chain = options.chain;
    }
    if (options.allowedChains?.length) {
      params.allowedChains = options.allowedChains.join(",");
    }
    if (options.onlyUsdc) {
      params.onlyUsdc = "true";
    }

    const response = await this.http.get<unknown>("/api/balances", params);
    return DetailedBalancesSchema.parse(response);
  }

  async evmTransfer(options: EvmTransferOptions): Promise<SubmitTransaction> {
    const validated = EvmTransferOptionsSchema.parse(options);
    const response = await this.http.post<unknown>("/api/transfers/evm", validated);
    return SubmitTransactionSchema.parse(response);
  }

  async solanaTransfer(options: SolanaTransferOptions): Promise<SubmitTransaction> {
    const validated = SolanaTransferOptionsSchema.parse(options);
    const response = await this.http.post<unknown>("/api/transfers/solana", validated);
    return SubmitTransactionSchema.parse(response);
  }

  async getSolanaTokens(chain: SolanaChain): Promise<SolanaTokensResponse> {
    const response = await this.http.get<unknown>("/api/solana/tokens", { chain });
    return SolanaTokensResponseSchema.parse(response);
  }

  async searchSolanaTokens(query: string, limit?: number): Promise<SolanaTokenSearchResponse> {
    const params: Record<string, string> = { query };
    if (limit !== undefined) params.limit = limit.toString();
    const response = await this.http.get<unknown>("/api/solana/tokens/search", params);
    return SolanaTokenSearchResponseSchema.parse(response);
  }

  async getTransactionHistoryDetailed(
    options: TransactionHistoryDetailedOptions = {},
  ): Promise<TransactionHistoryDetailed> {
    const params: Record<string, string> = {};
    if (options.limit !== undefined) params.limit = options.limit.toString();
    if (options.chain) params.chain = options.chain;
    const response = await this.http.get<unknown>("/api/transactions/history", params);
    return TransactionHistoryDetailedSchema.parse(response);
  }

  async requestFunding(options: FundingRequestOptions): Promise<FundingRequestResponse> {
    const response = await this.http.post<unknown>("/api/funding-requests", options);
    return FundingRequestResponseSchema.parse(response);
  }

  async createOnrampLink(options: OnrampCryptoOptions): Promise<OnrampCryptoResponse> {
    const validated = OnrampCryptoOptionsSchema.parse(options);
    const response = await this.http.post<unknown>("/api/onramp/crypto", validated);
    return OnrampCryptoResponseSchema.parse(response);
  }

  async claimSignupBonus(): Promise<SignupBonusClaimResponse> {
    const response = await this.http.post<unknown>("/api/signup-bonus/claim", {});
    return SignupBonusClaimResponseSchema.parse(response);
  }

  async sponge(request: SpongeRequest): Promise<SpongeResponse> {
    const response = await this.http.post<unknown>("/api/sponge", request);
    return SpongeResponseSchema.parse(response);
  }

  async createX402Payment(options: CreateX402PaymentOptions): Promise<X402PaymentResponse> {
    const response = await this.http.post<unknown>("/api/x402/payments", options);
    return X402PaymentResponseSchema.parse(response);
  }
}
