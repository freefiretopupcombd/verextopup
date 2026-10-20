// ==================================================
// SEO Module — Types
// ==================================================

export type SeoSettings = {
  // ---- Site identity ----
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  siteUrl: string;

  // ---- Brand logo text ----
  brandNamePart1: string;
  brandNamePart2: string;
  brandTagline: string;

  // ---- Organization ----
  organizationName: string;
  organizationLegalName: string;
  organizationLogo: string;
  organizationType: string;
  foundingYear: string;

  // ---- Contact ----
  contactEmail: string;
  contactPhone: string;

  // ---- Address ----
  addressStreet: string;
  addressCity: string;
  addressRegion: string;
  addressPostalCode: string;
  addressCountry: string;

  // ---- Social links ----
  socialFacebook: string;
  socialYoutube: string;
  socialInstagram: string;
  socialTwitter: string;
  socialTiktok: string;
  socialWhatsapp: string;
  socialTelegram: string;

  // ---- Defaults ----
  defaultOgImage: string;
  defaultTwitterCard: "summary" | "summary_large_image" | "player" | "app";
  twitterHandle: string;

  // ---- Analytics & Verification ----
  analyticsGaId: string;
  analyticsGtmId: string;
  verificationGoogle: string;
  verificationBing: string;

  // ---- Advanced ----
  enableIndexing: boolean;
  primaryLocale: string;
  alternateLocales: string[];
};

export type SeoSettingsPartial = Partial<SeoSettings>;

export const SEO_SETTING_KEYS = {
  SITE_NAME: "seo.site_name",
  SITE_TAGLINE: "seo.site_tagline",
  SITE_DESCRIPTION: "seo.site_description",
  SITE_URL: "seo.site_url",
  BRAND_NAME_PART_1: "seo.brand_name_part_1",
  BRAND_NAME_PART_2: "seo.brand_name_part_2",
  BRAND_TAGLINE: "seo.brand_tagline",
  ORGANIZATION_NAME: "seo.organization_name",
  ORGANIZATION_LEGAL_NAME: "seo.organization_legal_name",
  ORGANIZATION_LOGO: "seo.organization_logo",
  ORGANIZATION_TYPE: "seo.organization_type",
  FOUNDING_YEAR: "seo.founding_year",
  CONTACT_EMAIL: "seo.contact_email",
  CONTACT_PHONE: "seo.contact_phone",
  ADDRESS_STREET: "seo.address_street",
  ADDRESS_CITY: "seo.address_city",
  ADDRESS_REGION: "seo.address_region",
  ADDRESS_POSTAL_CODE: "seo.address_postal_code",
  ADDRESS_COUNTRY: "seo.address_country",
  SOCIAL_FACEBOOK: "seo.social_facebook",
  SOCIAL_YOUTUBE: "seo.social_youtube",
  SOCIAL_INSTAGRAM: "seo.social_instagram",
  SOCIAL_TWITTER: "seo.social_twitter",
  SOCIAL_TIKTOK: "seo.social_tiktok",
  SOCIAL_WHATSAPP: "seo.social_whatsapp",
  SOCIAL_TELEGRAM: "seo.social_telegram",
  DEFAULT_OG_IMAGE: "seo.default_og_image",
  DEFAULT_TWITTER_CARD: "seo.default_twitter_card",
  TWITTER_HANDLE: "seo.twitter_handle",
  ANALYTICS_GA_ID: "seo.analytics_ga_id",
  ANALYTICS_GTM_ID: "seo.analytics_gtm_id",
  VERIFICATION_GOOGLE: "seo.verification_google",
  VERIFICATION_BING: "seo.verification_bing",
  ENABLE_INDEXING: "seo.enable_indexing",
  PRIMARY_LOCALE: "seo.primary_locale",
  ALTERNATE_LOCALES: "seo.alternate_locales",
} as const;

export const ORGANIZATION_TYPES = [
  "Organization",
  "OnlineStore",
  "Corporation",
  "LocalBusiness",
  "ECommercePlatform",
] as const;