"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// Currency Settings Keys
// ==================================================
const KEYS = {
  USD_TO_BDT: "currency.usd_to_bdt",
  DEFAULT_CURRENCY: "currency.default",
};

// ==================================================
// Get Currency Settings (server-side fetch)
// ==================================================
export async function getCurrencySettings() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [KEYS.USD_TO_BDT, KEYS.DEFAULT_CURRENCY],
      },
    },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  return {
    usdToBdt: Number(map.get(KEYS.USD_TO_BDT) || 127),
    defaultCurrency: (map.get(KEYS.DEFAULT_CURRENCY) || "BDT") as
      | "BDT"
      | "USDT",
  };
}

// ==================================================
// Update Currency Settings
// ==================================================
const currencySchema = z.object({
  usdToBdt: z.coerce
    .number()
    .min(1, "Rate কমপক্ষে ১ হতে হবে")
    .max(10000, "Rate অনেক বেশি"),
  defaultCurrency: z.enum(["BDT", "USDT"]).default("BDT"),
});

export async function updateCurrencySettingsAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = currencySchema.safeParse({
    usdToBdt: formData.get("usdToBdt"),
    defaultCurrency: formData.get("defaultCurrency") || "BDT",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { usdToBdt, defaultCurrency } = parsed.data;

  try {
    // Upsert both settings
    await prisma.siteSetting.upsert({
      where: { key: KEYS.USD_TO_BDT },
      update: { value: String(usdToBdt), category: "currency" },
      create: {
        key: KEYS.USD_TO_BDT,
        value: String(usdToBdt),
        category: "currency",
      },
    });

    await prisma.siteSetting.upsert({
      where: { key: KEYS.DEFAULT_CURRENCY },
      update: { value: defaultCurrency, category: "currency" },
      create: {
        key: KEYS.DEFAULT_CURRENCY,
        value: defaultCurrency,
        category: "currency",
      },
    });

    revalidatePath("/admin/settings/currency");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Currency settings সফলভাবে update হয়েছে",
    };
  } catch (error) {
    console.error("Currency settings error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}