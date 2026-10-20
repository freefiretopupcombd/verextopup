"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

import { invalidateSeoCache } from "./defaults";
import { seoSettingsSchema } from "./settings-schema";
import { SEO_SETTING_KEYS } from "./types";

export type SeoActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// FORM PARSER
// ==================================================
function parseSeoSettingsForm(formData: FormData) {
  const getString = (key: string) => {
    const val = formData.get(key);
    return typeof val === "string" ? val : "";
  };

  const getBool = (key: string) => {
    const val = formData.get(key);
    return val === "on" || val === "true";
  };

  let alternateLocales: string[] = [];
  try {
    const raw = formData.get("alternateLocales");
    if (typeof raw === "string" && raw.length > 0) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        alternateLocales = parsed.filter(
          (v): v is string => typeof v === "string"
        );
      }
    }
  } catch {
    alternateLocales = [];
  }

  return {
    // Site identity
    siteName: getString("siteName"),
    siteTagline: getString("siteTagline"),
    siteDescription: getString("siteDescription"),
    siteUrl: getString("siteUrl"),

    // Brand
    brandNamePart1: getString("brandNamePart1") || "Verex",
    brandNamePart2: getString("brandNamePart2") || "TopUp",
    brandTagline: getString("brandTagline"),

    // Organization
    organizationName: getString("organizationName"),
    organizationLegalName: getString("organizationLegalName"),
    organizationLogo: getString("organizationLogo"),
    organizationType: getString("organizationType") || "Organization",
    foundingYear: getString("foundingYear"),

    // Contact
    contactEmail: getString("contactEmail"),
    contactPhone: getString("contactPhone"),

    // Address
    addressStreet: getString("addressStreet"),
    addressCity: getString("addressCity"),
    addressRegion: getString("addressRegion"),
    addressPostalCode: getString("addressPostalCode"),
    addressCountry: getString("addressCountry") || "BD",

    // Social
    socialFacebook: getString("socialFacebook"),
    socialYoutube: getString("socialYoutube"),
    socialInstagram: getString("socialInstagram"),
    socialTwitter: getString("socialTwitter"),
    socialTiktok: getString("socialTiktok"),
    socialWhatsapp: getString("socialWhatsapp"),
    socialTelegram: getString("socialTelegram"),

    // Defaults
    defaultOgImage: getString("defaultOgImage") || "/og-default.jpg",
    defaultTwitterCard:
      getString("defaultTwitterCard") || "summary_large_image",
    twitterHandle: getString("twitterHandle"),

    // Analytics
    analyticsGaId: getString("analyticsGaId"),
    analyticsGtmId: getString("analyticsGtmId"),
    verificationGoogle: getString("verificationGoogle"),
    verificationBing: getString("verificationBing"),

    // Advanced
    enableIndexing: getBool("enableIndexing"),
    primaryLocale: getString("primaryLocale") || "en_US",
    alternateLocales,
  };
}

// ==================================================
// BUILD ROWS
// ==================================================
function buildSettingRows(data: z.infer<typeof seoSettingsSchema>) {
  const K = SEO_SETTING_KEYS;

  return [
    // Site identity
    { key: K.SITE_NAME, value: data.siteName },
    { key: K.SITE_TAGLINE, value: data.siteTagline || "" },
    { key: K.SITE_DESCRIPTION, value: data.siteDescription || "" },
    { key: K.SITE_URL, value: data.siteUrl },

    // Brand
    { key: K.BRAND_NAME_PART_1, value: data.brandNamePart1 },
    { key: K.BRAND_NAME_PART_2, value: data.brandNamePart2 },
    { key: K.BRAND_TAGLINE, value: data.brandTagline || "" },

    // Organization
    { key: K.ORGANIZATION_NAME, value: data.organizationName },
    {
      key: K.ORGANIZATION_LEGAL_NAME,
      value: data.organizationLegalName || "",
    },
    { key: K.ORGANIZATION_LOGO, value: data.organizationLogo || "" },
    { key: K.ORGANIZATION_TYPE, value: data.organizationType },
    { key: K.FOUNDING_YEAR, value: data.foundingYear || "" },

    // Contact
    { key: K.CONTACT_EMAIL, value: data.contactEmail || "" },
    { key: K.CONTACT_PHONE, value: data.contactPhone || "" },

    // Address
    { key: K.ADDRESS_STREET, value: data.addressStreet || "" },
    { key: K.ADDRESS_CITY, value: data.addressCity || "" },
    { key: K.ADDRESS_REGION, value: data.addressRegion || "" },
    { key: K.ADDRESS_POSTAL_CODE, value: data.addressPostalCode || "" },
    { key: K.ADDRESS_COUNTRY, value: data.addressCountry },

    // Social
    { key: K.SOCIAL_FACEBOOK, value: data.socialFacebook || "" },
    { key: K.SOCIAL_YOUTUBE, value: data.socialYoutube || "" },
    { key: K.SOCIAL_INSTAGRAM, value: data.socialInstagram || "" },
    { key: K.SOCIAL_TWITTER, value: data.socialTwitter || "" },
    { key: K.SOCIAL_TIKTOK, value: data.socialTiktok || "" },
    { key: K.SOCIAL_WHATSAPP, value: data.socialWhatsapp || "" },
    { key: K.SOCIAL_TELEGRAM, value: data.socialTelegram || "" },

    // Defaults
    { key: K.DEFAULT_OG_IMAGE, value: data.defaultOgImage },
    { key: K.DEFAULT_TWITTER_CARD, value: data.defaultTwitterCard },
    { key: K.TWITTER_HANDLE, value: data.twitterHandle || "" },

    // Analytics
    { key: K.ANALYTICS_GA_ID, value: data.analyticsGaId || "" },
    { key: K.ANALYTICS_GTM_ID, value: data.analyticsGtmId || "" },
    { key: K.VERIFICATION_GOOGLE, value: data.verificationGoogle || "" },
    { key: K.VERIFICATION_BING, value: data.verificationBing || "" },

    // Advanced
    { key: K.ENABLE_INDEXING, value: String(data.enableIndexing) },
    { key: K.PRIMARY_LOCALE, value: data.primaryLocale },
    { key: K.ALTERNATE_LOCALES, value: JSON.stringify(data.alternateLocales) },
  ];
}

// ==================================================
// UPDATE ACTION
// ==================================================
export async function updateSeoSettingsAction(
  prevState: SeoActionState,
  formData: FormData
): Promise<SeoActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const raw = parseSeoSettingsForm(formData);
  const parsed = seoSettingsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;
  const rows = buildSettingRows(data);

  try {
    await prisma.$transaction(
      rows.map((row) =>
        prisma.siteSetting.upsert({
          where: { key: row.key },
          update: { value: row.value, category: "seo" },
          create: {
            key: row.key,
            value: row.value,
            category: "seo",
            isSecret: false,
          },
        })
      )
    );

    invalidateSeoCache();

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings/seo");

    return {
      success: true,
      message: "SEO settings সফলভাবে save হয়েছে",
    };
  } catch (error) {
    console.error("Update SEO settings error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// RESET ACTION
// ==================================================
export async function resetSeoSettingsAction(): Promise<SeoActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.siteSetting.deleteMany({
      where: { category: "seo" },
    });

    invalidateSeoCache();

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings/seo");

    return {
      success: true,
      message: "SEO settings default এ reset হয়েছে",
    };
  } catch (error) {
    console.error("Reset SEO settings error:", error);
    return {
      success: false,
      message: "Reset failed — কিছু ভুল হয়েছে",
    };
  }
}