import { describe, expect, it, vi } from "vitest";
import { SpongeApiError } from "../src/api/http.js";
import { SpongePlatform } from "../src/platform.js";

describe("SpongePlatform Bridge fiat", () => {
  it("returns null when no Bridge customer exists yet", async () => {
    const platform = await SpongePlatform.connect({
      apiKey: "sponge_master_123",
    });

    (platform as any).http.get = vi.fn().mockResolvedValue({
      kycStatus: null,
      tosStatus: null,
    });

    const customer = await platform.getBridgeCustomer();

    expect(customer).toBeNull();
    expect((platform as any).http.get).toHaveBeenCalledWith(
      "/api/bridge-fiat/customer",
      { forceRefresh: undefined }
    );
  });

  it("creates KYC links and links external accounts", async () => {
    const post = vi
      .fn()
      .mockResolvedValueOnce({
        url: "https://bridge.example/kyc",
        customer: {
          id: "customer_local",
          bridgeCustomerId: "bridge_customer_123",
          kycLinkId: "kyc_123",
          status: "active",
          kycStatus: "approved",
          tosStatus: "approved",
          hasAcceptedTermsOfService: true,
          capabilities: { fiat: "active" },
          endorsements: [],
          requestedWalletId: null,
          requestedAt: null,
          livemode: false,
          hostedLinkUrl: "https://bridge.example/hosted",
          tosLinkUrl: null,
          customerType: "individual",
          updatedAt: "2026-03-25T00:00:00.000Z",
        },
      })
      .mockResolvedValueOnce({
        id: "external_local",
        bridgeExternalAccountId: "bank_123",
        bridgeCustomerId: "bridge_customer_123",
        currency: "usd",
        last4: "6789",
        active: true,
        livemode: false,
        bankName: "Chase",
        accountType: "checking",
        accountOwnerType: null,
        createdAt: "2026-03-25T00:00:00.000Z",
        updatedAt: "2026-03-25T00:00:00.000Z",
      });

    const platform = await SpongePlatform.connect({
      apiKey: "sponge_master_123",
    });

    (platform as any).http.post = post;

    const link = await platform.createBridgeKycLink({
      walletId: "wallet_123",
      redirectUri: "https://app.example/callback",
      customerType: "individual",
    });

    const account = await platform.createBridgeExternalAccount({
      customerId: "bridge_customer_123",
      bankName: "Chase",
      accountOwnerName: "Jane Smith",
      routingNumber: "021000021",
      accountNumber: "123456789",
      checkingOrSavings: "checking",
      streetLine1: "123 Main St",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
    });

    expect(link.url).toBe("https://bridge.example/kyc");
    expect(account.bridgeExternalAccountId).toBe("bank_123");
    expect(post).toHaveBeenNthCalledWith(1, "/api/bridge-fiat/customer/kyc-link", {
      walletId: "wallet_123",
      redirectUri: "https://app.example/callback",
      customerType: "individual",
    });
    expect(post).toHaveBeenNthCalledWith(2, "/api/bridge-fiat/external-accounts", {
      customerId: "bridge_customer_123",
      bankName: "Chase",
      accountOwnerName: "Jane Smith",
      routingNumber: "021000021",
      accountNumber: "123456789",
      checkingOrSavings: "checking",
      streetLine1: "123 Main St",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
    });
  });

  it("creates virtual accounts and transfers, and treats missing virtual accounts as null", async () => {
    const get = vi
      .fn()
      .mockRejectedValueOnce(new SpongeApiError(404, "not_found", "not found"))
      .mockResolvedValueOnce([
        {
          id: "transfer_local",
          bridgeTransferId: "transfer_123",
          bridgeCustomerId: "bridge_customer_123",
          bridgeExternalAccountId: "bank_123",
          walletId: "wallet_123",
          status: "funding_submitted",
          amount: "100.00",
          sourceCurrency: "usdc",
          sourcePaymentRail: "base",
          destinationCurrency: "usd",
          destinationPaymentRail: "ach",
          fundingTxHash: null,
          fundingExplorerUrl: null,
          failureReason: null,
          receiptUrl: null,
          depositInstructions: null,
          isStaticTemplate: false,
          livemode: false,
          createdAt: "2026-03-25T00:00:00.000Z",
          updatedAt: "2026-03-25T00:00:00.000Z",
        },
      ]);
    const post = vi
      .fn()
      .mockResolvedValueOnce({
        id: "virtual_local",
        bridgeVirtualAccountId: "va_123",
        bridgeCustomerId: "bridge_customer_123",
        walletId: "wallet_123",
        status: "active",
        sourceCurrency: "usd",
        destinationCurrency: "usdc",
        destinationPaymentRail: "base",
        destinationAddress: "0xabc",
        depositInstructions: { accountNumber: "123456789" },
        activities: [],
        accountReadyNotifiedAt: null,
        livemode: false,
        createdAt: "2026-03-25T00:00:00.000Z",
        updatedAt: "2026-03-25T00:00:00.000Z",
      })
      .mockResolvedValueOnce({
        id: "transfer_local",
        bridgeTransferId: "transfer_123",
        bridgeCustomerId: "bridge_customer_123",
        bridgeExternalAccountId: "bank_123",
        walletId: "wallet_123",
        status: "funding_submitted",
        amount: "100.00",
        sourceCurrency: "usdc",
        sourcePaymentRail: "base",
        destinationCurrency: "usd",
        destinationPaymentRail: "ach",
        fundingTxHash: null,
        fundingExplorerUrl: null,
        failureReason: null,
        receiptUrl: null,
        depositInstructions: null,
        isStaticTemplate: false,
        livemode: false,
        createdAt: "2026-03-25T00:00:00.000Z",
        updatedAt: "2026-03-25T00:00:00.000Z",
      });

    const platform = await SpongePlatform.connect({
      apiKey: "sponge_master_123",
    });

    (platform as any).http.get = get;
    (platform as any).http.post = post;

    const missingAccount = await platform.getBridgeVirtualAccount("wallet_123");
    const virtualAccount = await platform.createBridgeVirtualAccount("wallet_123");
    const transfer = await platform.createBridgeTransfer({
      walletId: "wallet_123",
      externalAccountId: "external_local",
      amount: "100.00",
    });
    const transfers = await platform.listBridgeTransfers();

    expect(missingAccount).toBeNull();
    expect(virtualAccount.bridgeVirtualAccountId).toBe("va_123");
    expect(transfer.bridgeTransferId).toBe("transfer_123");
    expect(transfers).toHaveLength(1);
    expect(post).toHaveBeenNthCalledWith(
      1,
      "/api/bridge-fiat/wallets/wallet_123/virtual-account"
    );
    expect(post).toHaveBeenNthCalledWith(2, "/api/bridge-fiat/transfers", {
      walletId: "wallet_123",
      externalAccountId: "external_local",
      amount: "100.00",
    });
    expect(get).toHaveBeenNthCalledWith(2, "/api/bridge-fiat/transfers", {
      transferId: undefined,
    });
  });
});
