import "server-only";

import { prisma } from "@/lib/prisma";

import {
  SEO_DEFAULTS,
  buildSocialLinks,
  getCachedSeoSettings,
  hasAddress,
  normalizeSiteUrl,
  setCachedSeoSettings,
} from "./defaults";
import type { SeoSettings } from "./types";
import { SEO_SETTING_KEYS } from "./types";

// ==================================================
// GET SEO SETTINGS
// ==================================================
export async function getSeoSettings(): Promise<SeoSettings> {
  const cached = getCachedSeoSettings();
  if (cached) return cached;

  const rows = await prisma.siteSetting.findMany({
    where: { category: "seo" },
  });

  const settingsMap = new Map<string, string>();
  for (const row of rows) {
    settingsMap.set(row.key, row.value);
  }

  const settings: SeoSettings = {
    // ---- Site identity ----
    siteName:
      settingsMap.get(SEO_SETTING_KEYS.SITE_NAME) || SEO_DEFAULTS.siteName,
    siteTagline:
      settingsMap.get(SEO_SETTING_KEYS.SITE_TAGLINE) ||
      SEO_DEFAULTS.siteTagline,
    siteDescription:
      settingsMap.get(SEO_SETTING_KEYS.SITE_DESCRIPTION) ||
      SEO_DEFAULTS.siteDescription,
    siteUrl: normalizeSiteUrl(
      settingsMap.get(SEO_SETTING_KEYS.SITE_URL) || SEO_DEFAULTS.siteUrl
    ),

    // ---- Brand logo text ----
    brandNamePart1:
      settingsMap.get(SEO_SETTING_KEYS.BRAND_NAME_PART_1) ||
      SEO_DEFAULTS.brandNamePart1,
    brandNamePart2:
      settingsMap.get(SEO_SETTING_KEYS.BRAND_NAME_PART_2) ||
      SEO_DEFAULTS.brandNamePart2,
    brandTagline:
      settingsMap.get(SEO_SETTING_KEYS.BRAND_TAGLINE) ||
      SEO_DEFAULTS.brandTagline,

    // ---- Organization ----
    organizationName:
      settingsMap.get(SEO_SETTING_KEYS.ORGANIZATION_NAME) ||
      SEO_DEFAULTS.organizationName,
    organizationLegalName:
      settingsMap.get(SEO_SETTING_KEYS.ORGANIZATION_LEGAL_NAME) ||
      SEO_DEFAULTS.organizationLegalName,
    organizationLogo:
      settingsMap.get(SEO_SETTING_KEYS.ORGANIZATION_LOGO) ||
      SEO_DEFAULTS.organizationLogo,
    organizationType:
      settingsMap.get(SEO_SETTING_KEYS.ORGANIZATION_TYPE) ||
      SEO_DEFAULTS.organizationType,
    foundingYear:
      settingsMap.get(SEO_SETTING_KEYS.FOUNDING_YEAR) ||
      SEO_DEFAULTS.foundingYear,

    // ---- Contact ----
    contactEmail:
      settingsMap.get(SEO_SETTING_KEYS.CONTACT_EMAIL) ||
      SEO_DEFAULTS.contactEmail,
    contactPhone:
      settingsMap.get(SEO_SETTING_KEYS.CONTACT_PHONE) ||
      SEO_DEFAULTS.contactPhone,

    // ---- Address ----
    addressStreet:
      settingsMap.get(SEO_SETTING_KEYS.ADDRESS_STREET) ||
      SEO_DEFAULTS.addressStreet,
    addressCity:
      settingsMap.get(SEO_SETTING_KEYS.ADDRESS_CITY) ||
      SEO_DEFAULTS.addressCity,
    addressRegion:
      settingsMap.get(SEO_SETTING_KEYS.ADDRESS_REGION) ||
      SEO_DEFAULTS.addressRegion,
    addressPostalCode:
      settingsMap.get(SEO_SETTING_KEYS.ADDRESS_POSTAL_CODE) ||
      SEO_DEFAULTS.addressPostalCode,
    addressCountry:
      settingsMap.get(SEO_SETTING_KEYS.ADDRESS_COUNTRY) ||
      SEO_DEFAULTS.addressCountry,

    // ---- Social ----
    socialFacebook:
      settingsMap.get(SEO_SETTING_KEYS.SOCIAL_FACEBOOK) ||
      SEO_DEFAULTS.socialFacebook,
    socialYoutube:
      settingsMap.get(SEO_SETTING_KEYS.SOCIAL_YOUTUBE) ||
      SEO_DEFAULTS.socialYoutube,
    socialInstagram:
      settingsMap.get(SEO_SETTING_KEYS.SOCIAL_INSTAGRAM) ||
      SEO_DEFAULTS.socialInstagram,
    socialTwitter:
      settingsMap.get(SEO_SETTING_KEYS.SOCIAL_TWITTER) ||
      SEO_DEFAULTS.socialTwitter,
    socialTiktok:
      settingsMap.get(SEO_SETTING_KEYS.SOCIAL_TIKTOK) ||
      SEO_DEFAULTS.socialTiktok,
    socialWhatsapp:
      settingsMap.get(SEO_SETTING_KEYS.SOCIAL_WHATSAPP) ||
      SEO_DEFAULTS.socialWhatsapp,
    socialTelegram:
      settingsMap.get(SEO_SETTING_KEYS.SOCIAL_TELEGRAM) ||
      SEO_DEFAULTS.socialTelegram,

    // ---- Defaults ----
    defaultOgImage:
      settingsMap.get(SEO_SETTING_KEYS.DEFAULT_OG_IMAGE) ||
      SEO_DEFAULTS.defaultOgImage,
    defaultTwitterCard:
      (settingsMap.get(
        SEO_SETTING_KEYS.DEFAULT_TWITTER_CARD
      ) as SeoSettings["defaultTwitterCard"]) ||
      SEO_DEFAULTS.defaultTwitterCard,
    twitterHandle:
      settingsMap.get(SEO_SETTING_KEYS.TWITTER_HANDLE) ||
      SEO_DEFAULTS.twitterHandle,

    // ---- Analytics ----
    analyticsGaId:
      settingsMap.get(SEO_SETTING_KEYS.ANALYTICS_GA_ID) ||
      SEO_DEFAULTS.analyticsGaId,
    analyticsGtmId:
      settingsMap.get(SEO_SETTING_KEYS.ANALYTICS_GTM_ID) ||
      SEO_DEFAULTS.analyticsGtmId,
    verificationGoogle:
      settingsMap.get(SEO_SETTING_KEYS.VERIFICATION_GOOGLE) ||
      SEO_DEFAULTS.verificationGoogle,
    verificationBing:
      settingsMap.get(SEO_SETTING_KEYS.VERIFICATION_BING) ||
      SEO_DEFAULTS.verificationBing,

    // ---- Advanced ----
    enableIndexing:
      settingsMap.get(SEO_SETTING_KEYS.ENABLE_INDEXING) !== "false",
    primaryLocale:
      settingsMap.get(SEO_SETTING_KEYS.PRIMARY_LOCALE) ||
      SEO_DEFAULTS.primaryLocale,
    alternateLocales: (() => {
      const raw = settingsMap.get(SEO_SETTING_KEYS.ALTERNATE_LOCALES);
      if (!raw) return SEO_DEFAULTS.alternateLocales;
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : SEO_DEFAULTS.alternateLocales;
      } catch {
        return SEO_DEFAULTS.alternateLocales;
      }
    })(),
  };

  setCachedSeoSettings(settings);
  return settings;
}

export async function getSocialLinks(): Promise<string[]> {
  const settings = await getSeoSettings();
  return buildSocialLinks(settings);
}

export async function hasOrganizationAddress(): Promise<boolean> {
  const settings = await getSeoSettings();
  return hasAddress(settings);
}

export async function getSeoSetting<K extends keyof SeoSettings>(
  key: K
): Promise<SeoSettings[K]> {
  const settings = await getSeoSettings();
  return settings[key];
}