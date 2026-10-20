import { z } from "zod";

import { ORGANIZATION_TYPES } from "./types";

// ---- Helpers ----
const optionalUrl = z
  .string()
  .url("সঠিক URL দিন (https://...)")
  .optional()
  .or(z.literal(""));

const optionalEmail = z
  .string()
  .email("সঠিক email দিন")
  .optional()
  .or(z.literal(""));

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

// ==================================================
// MAIN SCHEMA
// ==================================================
export const seoSettingsSchema = z.object({
  // ---- Site identity ----
  siteName: z
    .string()
    .min(2, "Site name কমপক্ষে ২ character")
    .max(100),
  siteTagline: z.string().max(100).optional().or(z.literal("")),
  siteDescription: z.string().max(300).optional().or(z.literal("")),
  siteUrl: z
    .string()
    .url("সঠিক site URL দিন")
    .transform((val) => val.replace(/\/+$/, "")),

  // ---- Brand logo text ----
  brandNamePart1: z.string().min(1).max(30).default("Verex"),
  brandNamePart2: z.string().min(1).max(30).default("TopUp"),
  brandTagline: z.string().max(80).optional().or(z.literal("")),

  // ---- Organization ----
  organizationName: z.string().min(2).max(200),
  organizationLegalName: optionalString(200),
  organizationLogo: z.string().min(1).max(500).or(z.literal("")),
  organizationType: z.enum(ORGANIZATION_TYPES).default("Organization"),
  foundingYear: z
    .string()
    .regex(/^\d{4}$/, "৪ ডিজিটের বছর")
    .optional()
    .or(z.literal("")),

  // ---- Contact ----
  contactEmail: optionalEmail,
  contactPhone: z.string().max(30).optional().or(z.literal("")),

  // ---- Address ----
  addressStreet: optionalString(200),
  addressCity: optionalString(100),
  addressRegion: optionalString(100),
  addressPostalCode: optionalString(20),
  addressCountry: z
    .string()
    .min(2)
    .max(2)
    .default("BD")
    .transform((val) => val.toUpperCase()),

  // ---- Social ----
  socialFacebook: optionalUrl,
  socialYoutube: optionalUrl,
  socialInstagram: optionalUrl,
  socialTwitter: optionalUrl,
  socialTiktok: optionalUrl,
  socialWhatsapp: optionalUrl,
  socialTelegram: optionalUrl,

  // ---- Defaults ----
  defaultOgImage: z.string().min(1).max(500),
  defaultTwitterCard: z
    .enum(["summary", "summary_large_image", "player", "app"])
    .default("summary_large_image"),
  twitterHandle: z
    .string()
    .max(50)
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val) return true;
        return /^@?[A-Za-z0-9_]{1,15}$/.test(val);
      },
      { message: "Twitter handle সঠিক নয়" }
    ),

  // ---- Analytics ----
  analyticsGaId: z
    .string()
    .regex(/^(G-[A-Z0-9]+|UA-\d+-\d+|)$/, "GA4 ID: G-XXXXX")
    .optional()
    .or(z.literal("")),
  analyticsGtmId: z
    .string()
    .regex(/^(GTM-[A-Z0-9]+|)$/, "GTM ID: GTM-XXXXX")
    .optional()
    .or(z.literal("")),
  verificationGoogle: z.string().max(200).optional().or(z.literal("")),
  verificationBing: z.string().max(200).optional().or(z.literal("")),

  // ---- Advanced ----
  enableIndexing: z.boolean().default(true),
  primaryLocale: z
    .string()
    .regex(/^[a-z]{2}(_[A-Z]{2})?$/, "Format: en_US")
    .default("en_US"),
  alternateLocales: z
    .array(z.string().regex(/^[a-z]{2}(_[A-Z]{2})?$/))
    .default(["bn_BD"]),
});

export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;

export const seoSettingsPartialSchema = seoSettingsSchema.partial();

export type SeoSettingsPartialInput = z.infer<typeof seoSettingsPartialSchema>;

// ==================================================
// HEALTH ANALYSIS
// ==================================================
export type SeoWarning = {
  field: string;
  level: "error" | "warning" | "info";
  message: string;
};

export function analyzeSeoSettings(data: SeoSettingsInput): SeoWarning[] {
  const warnings: SeoWarning[] = [];

  if (!data.organizationLogo) {
    warnings.push({
      field: "organizationLogo",
      level: "warning",
      message: "Logo URL নেই — Google Knowledge Panel এ দেখাবে না",
    });
  }

  if (!data.contactEmail) {
    warnings.push({
      field: "contactEmail",
      level: "info",
      message: "Contact email নেই — E-E-A-T signal দুর্বল হবে",
    });
  }

  const socialCount = [
    data.socialFacebook,
    data.socialYoutube,
    data.socialInstagram,
    data.socialTwitter,
    data.socialTiktok,
    data.socialWhatsapp,
    data.socialTelegram,
  ].filter(Boolean).length;

  if (socialCount === 0) {
    warnings.push({
      field: "socialFacebook",
      level: "warning",
      message: "কোনো social link নেই — brand trust কমবে",
    });
  }

  if (!data.defaultOgImage) {
    warnings.push({
      field: "defaultOgImage",
      level: "warning",
      message: "Default OG image নেই",
    });
  }

  if (!data.analyticsGaId && !data.analyticsGtmId) {
    warnings.push({
      field: "analyticsGaId",
      level: "info",
      message: "Analytics ID নেই — traffic tracking হবে না",
    });
  }

  return warnings;
}