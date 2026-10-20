import type { SeoSettings } from "./types";

export const SEO_DEFAULTS: SeoSettings = {
  // ---- Site identity ----
  siteName: "VerexTopUp",
  siteTagline: "Play More, Pay Less",
  siteDescription:
    "Bangladesh's #1 digital top-up platform. Instant game top-ups, gift cards, and subscriptions at the best prices.",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || "https://verextopup.com",

  // ---- Brand logo text ----
  brandNamePart1: "Verex",
  brandNamePart2: "TopUp",
  brandTagline: "Play More, Pay Less",

  // ---- Organization ----
  organizationName: "VerexTopUp",
  organizationLegalName: "",
  organizationLogo: "/logo.png",
  organizationType: "OnlineStore",
  foundingYear: "",

  // ---- Contact ----
  contactEmail: "",
  contactPhone: "",

  // ---- Address ----
  addressStreet: "",
  addressCity: "",
  addressRegion: "",
  addressPostalCode: "",
  addressCountry: "BD",

  // ---- Social links ----
  socialFacebook: "",
  socialYoutube: "",
  socialInstagram: "",
  socialTwitter: "",
  socialTiktok: "",
  socialWhatsapp: "",
  socialTelegram: "",

  // ---- Defaults ----
  defaultOgImage: "/og-default.jpg",
  defaultTwitterCard: "summary_large_image",
  twitterHandle: "",

  // ---- Analytics & Verification ----
  analyticsGaId: "",
  analyticsGtmId: "",
  verificationGoogle: "",
  verificationBing: "",

  // ---- Advanced ----
  enableIndexing: true,
  primaryLocale: "en_US",
  alternateLocales: ["bn_BD"],
};

// ==================================================
// CACHE
// ==================================================
type CacheEntry = {
  data: SeoSettings;
  expiresAt: number;
};

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 30_000;

export function getCachedSeoSettings(): SeoSettings | null {
  if (!cache) return null;
  if (Date.now() > cache.expiresAt) {
    cache = null;
    return null;
  }
  return cache.data;
}

export function setCachedSeoSettings(data: SeoSettings): void {
  cache = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export function invalidateSeoCache(): void {
  cache = null;
}

// ==================================================
// HELPERS
// ==================================================
export function buildSocialLinks(settings: SeoSettings): string[] {
  return [
    settings.socialFacebook,
    settings.socialYoutube,
    settings.socialInstagram,
    settings.socialTwitter,
    settings.socialTiktok,
    settings.socialWhatsapp,
    settings.socialTelegram,
  ].filter((url) => url && url.trim().length > 0);
}

export function buildHomepageTitle(settings: SeoSettings): string {
  if (settings.siteTagline && settings.siteTagline.trim()) {
    return `${settings.siteName} — ${settings.siteTagline}`;
  }
  return settings.siteName;
}

export function hasAddress(settings: SeoSettings): boolean {
  return !!(
    settings.addressStreet &&
    settings.addressCity &&
    settings.addressCountry
  );
}

export function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function absoluteUrl(path: string, siteUrl?: string): string {
  const base = normalizeSiteUrl(siteUrl || SEO_DEFAULTS.siteUrl);
  if (path.startsWith("http")) return path;
  if (!path.startsWith("/")) path = `/${path}`;
  return `${base}${path}`;
}