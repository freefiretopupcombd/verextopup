import "server-only";

import { prisma } from "@/lib/prisma";
import { decrypt, encrypt, maskSecret } from "@/lib/encryption";

// ==================================================
// UDDOKTAPAY CONFIG — DB-based with encryption
// ==================================================
// Storage strategy:
//   - Credentials → DB (encrypted with AES-256-GCM)
//   - Enabled/Disabled → DB (plain string)
//   - Fallback to .env if DB has no values yet
//
// Admin can edit credentials from /admin/payments
// ==================================================

const KEYS = {
  ENABLED: "payment.uddoktapay.enabled",
  API_URL: "payment.uddoktapay.api_url",
  API_KEY: "payment.uddoktapay.api_key",
  WEBHOOK_SECRET: "payment.uddoktapay.webhook_secret",
  ENVIRONMENT: "payment.uddoktapay.environment",
} as const;

// ==================================================
// TYPES
// ==================================================
export type UddoktaPayConfig = {
  enabled: boolean;
  apiUrl: string;
  apiKey: string;
  webhookSecret: string;
  environment: "sandbox" | "production";
};

export type UddoktaPayStatus = {
  enabled: boolean;
  configured: boolean;
  environment: "sandbox" | "production";
  apiUrl: string;
  apiKeyMasked: string;
  webhookSecretMasked: string;
};

// ==================================================
// GET CONFIG — internal (with decrypted secrets)
// ==================================================
export async function getUddoktaPayConfig(): Promise<UddoktaPayConfig | null> {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { in: Object.values(KEYS) },
    },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  // Read from DB; fallback to .env for backward compat
  const apiUrl =
    map.get(KEYS.API_URL) ||
    process.env.UDDOKTAPAY_API_URL ||
    "";

  const apiKeyEncrypted = map.get(KEYS.API_KEY);
  const apiKeyFromEnv = process.env.UDDOKTAPAY_API_KEY || "";

  let apiKey = "";
  if (apiKeyEncrypted) {
    try {
      apiKey = decrypt(apiKeyEncrypted);
    } catch (error) {
      console.error("Failed to decrypt UddoktaPay API key:", error);
      apiKey = "";
    }
  } else if (apiKeyFromEnv) {
    apiKey = apiKeyFromEnv;
  }

  const webhookSecretEncrypted = map.get(KEYS.WEBHOOK_SECRET);
  const webhookSecretFromEnv = process.env.UDDOKTAPAY_WEBHOOK_SECRET || "";

  let webhookSecret = "";
  if (webhookSecretEncrypted) {
    try {
      webhookSecret = decrypt(webhookSecretEncrypted);
    } catch {
      webhookSecret = "";
    }
  } else if (webhookSecretFromEnv) {
    webhookSecret = webhookSecretFromEnv;
  }

  const environment: "sandbox" | "production" =
    (map.get(KEYS.ENVIRONMENT) as "sandbox" | "production") ||
    (apiUrl.includes("sandbox") ? "sandbox" : "production");

  const enabled = map.get(KEYS.ENABLED) === "true";

  if (!apiUrl || !apiKey) {
    return null;
  }

  return {
    enabled,
    apiUrl,
    apiKey,
    webhookSecret,
    environment,
  };
}

// ==================================================
// GET STATUS — public (for admin UI)
// ==================================================
export async function getUddoktaPayStatus(): Promise<UddoktaPayStatus> {
  const config = await getUddoktaPayConfig();

  if (!config) {
    // Fallback for display even when not configured
    const envUrl = process.env.UDDOKTAPAY_API_URL || "https://sandbox.uddoktapay.com";
    const envKey = process.env.UDDOKTAPAY_API_KEY || "";

    return {
      enabled: false,
      configured: !!envKey,
      environment: envUrl.includes("sandbox") ? "sandbox" : "production",
      apiUrl: envUrl,
      apiKeyMasked: envKey ? maskSecret(envKey) : "Not configured",
      webhookSecretMasked: "Not configured",
    };
  }

  return {
    enabled: config.enabled,
    configured: true,
    environment: config.environment,
    apiUrl: config.apiUrl,
    apiKeyMasked: maskSecret(config.apiKey),
    webhookSecretMasked: config.webhookSecret
      ? maskSecret(config.webhookSecret)
      : "Not configured",
  };
}

// ==================================================
// SAVE CREDENTIALS — encrypt then save
// ==================================================
export async function saveUddoktaPayCredentials(input: {
  apiUrl: string;
  apiKey: string;
  webhookSecret?: string;
  environment: "sandbox" | "production";
}): Promise<void> {
  const rows = [
    {
      key: KEYS.API_URL,
      value: input.apiUrl.trim(),
      isSecret: false,
    },
    {
      key: KEYS.API_KEY,
      value: encrypt(input.apiKey.trim()),
      isSecret: true,
    },
    {
      key: KEYS.WEBHOOK_SECRET,
      value: input.webhookSecret?.trim()
        ? encrypt(input.webhookSecret.trim())
        : "",
      isSecret: true,
    },
    {
      key: KEYS.ENVIRONMENT,
      value: input.environment,
      isSecret: false,
    },
  ];

  await prisma.$transaction(
    rows.map((row) =>
      prisma.siteSetting.upsert({
        where: { key: row.key },
        update: {
          value: row.value,
          isSecret: row.isSecret,
        },
        create: {
          key: row.key,
          value: row.value,
          category: "payment",
          isSecret: row.isSecret,
        },
      })
    )
  );
}

// ==================================================
// TOGGLE ENABLED
// ==================================================
export async function setUddoktaPayEnabled(
  enabled: boolean
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: KEYS.ENABLED },
    update: { value: String(enabled) },
    create: {
      key: KEYS.ENABLED,
      value: String(enabled),
      category: "payment",
      isSecret: false,
    },
  });
}

// ==================================================
// CHECK IF ENABLED (for checkout)
// ==================================================
export async function isUddoktaPayEnabled(): Promise<boolean> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: KEYS.ENABLED },
  });
  return setting?.value === "true";
}

// ==================================================
// TEST CONNECTION — using saved credentials
// ==================================================
export async function testUddoktaPayConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const config = await getUddoktaPayConfig();

  if (!config) {
    return {
      success: false,
      message:
        "Credentials configure করা নেই। Edit Credentials click করে API URL এবং API Key দিন।",
    };
  }

  try {
    const response = await fetch(`${config.apiUrl}/api/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": config.apiKey,
      },
      body: JSON.stringify({
        full_name: "Test User",
        email: "test@example.com",
        amount: "0.01",
        metadata: { test: "true" },
        redirect_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        webhook_url: "https://example.com/webhook",
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (response.status === 401) {
      return {
        success: false,
        message: "API Key invalid। UddoktaPay panel থেকে নতুন key নিন।",
      };
    }

    if (response.ok && data.status === true) {
      return {
        success: true,
        message: `✅ Connection successful। Environment: ${
          config.environment === "sandbox" ? "Sandbox" : "Production"
        }`,
      };
    }

    return {
      success: true,
      message: `✅ API reachable। Response: ${data.message || response.statusText}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Connection failed: ${error.message}`,
    };
  }
}