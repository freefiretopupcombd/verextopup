"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { getClientIp } from "@/lib/rate-limit";
import { savePWAConfig } from "./settings";
import type { PWAConfig } from "./types";

export type PWAActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// VALIDATION SCHEMA
// ==================================================
const iconSchema = z.object({
  src: z.string().max(500000), // base64 can be large
  type: z.enum(["url", "base64"]),
});

const pwaConfigSchema = z.object({
  enabled: z.boolean(),
  bannerEnabled: z.boolean(),

  name: z.string().min(1).max(100),
  shortName: z.string().min(1).max(30),
  description: z.string().min(1).max(300),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  display: z.enum(["standalone", "fullscreen", "minimal-ui", "browser"]),
  orientation: z.enum([
    "portrait",
    "landscape",
    "any",
    "portrait-primary",
    "landscape-primary",
  ]),
  lang: z.string().min(2).max(10),

  banner: z.object({
    titleEn: z.string().min(1).max(100),
    titleBn: z.string().min(1).max(100),
    subtitleEn: z.string().min(1).max(200),
    subtitleBn: z.string().min(1).max(200),
    buttonTextEn: z.string().min(1).max(30),
    buttonTextBn: z.string().min(1).max(30),
    buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    delaySeconds: z.coerce.number().int().min(0).max(60),
    showAfterVisits: z.coerce.number().int().min(1).max(20),
    dismissDays: z.coerce.number().int().min(1).max(365),
    position: z.enum(["bottom", "top"]),
  }),

  icons: z.object({
    icon192: iconSchema,
    icon512: iconSchema,
    maskable192: iconSchema,
    maskable512: iconSchema,
    apple: iconSchema,
  }),

  conditions: z.object({
    onlyMobile: z.boolean(),
    onlyLoggedIn: z.boolean(),
    onlyNewUsers: z.boolean(),
    pages: z.enum(["all", "home", "products", "custom"]),
    customPaths: z.string().max(1000),
  }),
});

// ==================================================
// SAVE PWA CONFIG ACTION
// ==================================================
export async function savePWAConfigAction(
  prevState: PWAActionState,
  formData: FormData
): Promise<PWAActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  try {
    // Build config from form data
    const config: PWAConfig = {
      enabled: formData.get("enabled") === "on",
      bannerEnabled: formData.get("bannerEnabled") === "on",

      name: (formData.get("name") as string) || "",
      shortName: (formData.get("shortName") as string) || "",
      description: (formData.get("description") as string) || "",
      themeColor: (formData.get("themeColor") as string) || "#7C3AED",
      backgroundColor: (formData.get("backgroundColor") as string) || "#0a0a14",
      display: (formData.get("display") as any) || "standalone",
      orientation: (formData.get("orientation") as any) || "portrait",
      lang: (formData.get("lang") as string) || "bn-BD",

      banner: {
        titleEn: (formData.get("banner_titleEn") as string) || "",
        titleBn: (formData.get("banner_titleBn") as string) || "",
        subtitleEn: (formData.get("banner_subtitleEn") as string) || "",
        subtitleBn: (formData.get("banner_subtitleBn") as string) || "",
        buttonTextEn: (formData.get("banner_buttonTextEn") as string) || "",
        buttonTextBn: (formData.get("banner_buttonTextBn") as string) || "",
        buttonColor: (formData.get("banner_buttonColor") as string) || "#ff8c42",
        delaySeconds: Number(formData.get("banner_delaySeconds")) || 5,
        showAfterVisits: Number(formData.get("banner_showAfterVisits")) || 2,
        dismissDays: Number(formData.get("banner_dismissDays")) || 7,
        position: (formData.get("banner_position") as any) || "bottom",
      },

      icons: {
        icon192: {
          src: (formData.get("icon_192_src") as string) || "",
          type: (formData.get("icon_192_type") as any) || "url",
        },
        icon512: {
          src: (formData.get("icon_512_src") as string) || "",
          type: (formData.get("icon_512_type") as any) || "url",
        },
        maskable192: {
          src: (formData.get("icon_maskable192_src") as string) || "",
          type: (formData.get("icon_maskable192_type") as any) || "url",
        },
        maskable512: {
          src: (formData.get("icon_maskable512_src") as string) || "",
          type: (formData.get("icon_maskable512_type") as any) || "url",
        },
        apple: {
          src: (formData.get("icon_apple_src") as string) || "",
          type: (formData.get("icon_apple_type") as any) || "url",
        },
      },

      conditions: {
        onlyMobile: formData.get("cond_onlyMobile") === "on",
        onlyLoggedIn: formData.get("cond_onlyLoggedIn") === "on",
        onlyNewUsers: formData.get("cond_onlyNewUsers") === "on",
        pages: (formData.get("cond_pages") as any) || "all",
        customPaths: (formData.get("cond_customPaths") as string) || "",
      },
    };

    // Validate
    const parsed = pwaConfigSchema.safeParse(config);
    if (!parsed.success) {
      console.error("PWA validation errors:", z.flattenError(parsed.error));
      return {
        success: false,
        message: "Invalid input",
        errors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    await savePWAConfig(config);

    // Audit log
    const headersList = await headers();
    const ip = getClientIp(headersList);
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorType: "ADMIN",
        action: "pwa.config_updated",
        targetType: "SiteSetting",
        targetId: "pwa_config",
        newValue: {
          enabled: config.enabled,
          bannerEnabled: config.bannerEnabled,
          name: config.name,
          themeColor: config.themeColor,
        },
        ipAddress: ip,
        userAgent: headersList.get("user-agent") || "",
      },
    });

    revalidatePath("/admin/settings/pwa");
    revalidatePath("/", "layout");

    return { success: true, message: "PWA settings সফলভাবে save হয়েছে" };
  } catch (error) {
    console.error("Save PWA config error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// RESET TO DEFAULTS
// ==================================================
export async function resetPWAConfigAction(): Promise<PWAActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.siteSetting.delete({
      where: { key: "pwa_config" },
    });

    revalidatePath("/admin/settings/pwa");
    revalidatePath("/", "layout");

    return { success: true, message: "Default settings এ ফিরে গেছে" };
  } catch (error) {
    console.error("Reset PWA config error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}