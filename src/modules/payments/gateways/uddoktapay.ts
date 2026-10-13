import "server-only";

// ==================================================
// UDDOKTAPAY CLIENT
// ==================================================
// This module handles all communication with UddoktaPay.
//
// Flow:
//   1. checkout() → initiate payment, get payment_url
//   2. verify()   → server-to-server verify (CRITICAL)
//   3. ipn()      → webhook verification
//
// Security:
//   - API key never exposed to client
//   - Server-to-server verification only
//   - Webhook signature verification
// ==================================================

const UDDOKTAPAY_API_KEY = process.env.UDDOKTAPAY_API_KEY!;
const UDDOKTAPAY_API_URL =
  process.env.UDDOKTAPAY_API_URL || "https://sandbox.uddoktapay.com";

// ---- Types ----
export type CheckoutRequest = {
  full_name: string;
  email: string;
  amount: string;
  metadata: Record<string, string>;
  redirect_url: string;
  cancel_url: string;
  webhook_url: string;
};

export type CheckoutResponse = {
  status: boolean;
  message: string;
  payment_url?: string;
};

export type VerifyResponse = {
  full_name: string;
  email: string;
  amount: string;
  fee: string;
  charged_amount: string;
  invoice_id: string;
  metadata: Record<string, string>;
  payment_method: string;
  sender_number: string;
  transaction_id: string;
  date: string;
  status: "COMPLETED" | "PENDING" | "ERROR";
};

// ==================================================
// CHECKOUT — Initiate payment
// ==================================================
export async function createCheckout(
  data: CheckoutRequest
): Promise<CheckoutResponse> {
  const response = await fetch(
    `${UDDOKTAPAY_API_URL}/api/checkout-v2`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`UddoktaPay checkout failed: ${response.status}`);
  }

  return response.json();
}

// ==================================================
// VERIFY — Server-to-server payment verification
// ==================================================
// ⚠️ CRITICAL: Never mark order paid based on redirect.
// ALWAYS call this function to verify payment.
// ==================================================
export async function verifyPayment(
  invoiceId: string
): Promise<VerifyResponse> {
  const response = await fetch(
    `${UDDOKTAPAY_API_URL}/api/verify-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    }
  );

  if (!response.ok) {
    throw new Error(`UddoktaPay verify failed: ${response.status}`);
  }

  return response.json();
}

// ==================================================
// IPN — Webhook verification
// ==================================================
// UddoktaPay sends webhook with API key in header.
// We verify it matches our API key.
// ==================================================
export function verifyIpnApiKey(ipnKey: string | null): boolean {
  if (!ipnKey) return false;
  return ipnKey === UDDOKTAPAY_API_KEY;
}