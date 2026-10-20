import "server-only";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SUPPORT_CONFIG,
  SUPPORT_CONFIG_KEY,
  type SupportWidgetConfig,
} from "./types";

// ==================================================
// GET SUPPORT WIDGET CONFIG
// ==================================================
export async function getSupportWidgetConfig(): Promise<SupportWidgetConfig> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: SUPPORT_CONFIG_KEY },
    });

    if (!setting) return DEFAULT_SUPPORT_CONFIG;

    const parsed = JSON.parse(setting.value);
    // Merge with defaults (in case new fields are added)
    return {
      ...DEFAULT_SUPPORT_CONFIG,
      ...parsed,
      channels: {
        ...DEFAULT_SUPPORT_CONFIG.channels,
        ...(parsed.channels || {}),
      },
    };
  } catch (error) {
    console.error("Get support widget config error:", error);
    return DEFAULT_SUPPORT_CONFIG;
  }
}

// ==================================================
// SAVE SUPPORT WIDGET CONFIG
// ==================================================
export async function saveSupportWidgetConfig(config: SupportWidgetConfig) {
  const setting = await prisma.siteSetting.upsert({
    where: { key: SUPPORT_CONFIG_KEY },
    update: {
      value: JSON.stringify(config),
      category: "support",
    },
    create: {
      key: SUPPORT_CONFIG_KEY,
      value: JSON.stringify(config),
      category: "support",
    },
  });

  return setting;
}