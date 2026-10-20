import "server-only";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PWA_CONFIG,
  PWA_CONFIG_KEY,
  type PWAConfig,
} from "./types";

// ==================================================
// GET PWA CONFIG
// ==================================================
export async function getPWAConfig(): Promise<PWAConfig> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: PWA_CONFIG_KEY },
    });

    if (!setting) return DEFAULT_PWA_CONFIG;

    const parsed = JSON.parse(setting.value);

    // Deep merge with defaults (for new fields)
    return {
      ...DEFAULT_PWA_CONFIG,
      ...parsed,
      banner: { ...DEFAULT_PWA_CONFIG.banner, ...(parsed.banner || {}) },
      icons: { ...DEFAULT_PWA_CONFIG.icons, ...(parsed.icons || {}) },
      conditions: {
        ...DEFAULT_PWA_CONFIG.conditions,
        ...(parsed.conditions || {}),
      },
    };
  } catch (error) {
    console.error("Get PWA config error:", error);
    return DEFAULT_PWA_CONFIG;
  }
}

// ==================================================
// SAVE PWA CONFIG
// ==================================================
export async function savePWAConfig(config: PWAConfig) {
  return prisma.siteSetting.upsert({
    where: { key: PWA_CONFIG_KEY },
    update: {
      value: JSON.stringify(config),
      category: "pwa",
    },
    create: {
      key: PWA_CONFIG_KEY,
      value: JSON.stringify(config),
      category: "pwa",
    },
  });
}