import { z } from "zod";

// ==================================================
// CONSTANTS
// ==================================================

export const PRODUCT_TYPES = [
  "TOPUP",
  "GIFT_CARD",
  "SUBSCRIPTION",
  "SERVICE",
] as const;

export const PRODUCT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export const DELIVERY_TYPES = ["MANUAL", "AUTOMATIC"] as const;
export const CHECKOUT_MODES = ["DIRECT", "CART", "BOTH"] as const;

export const FIELD_TYPES = [
  "text",
  "number",
  "email",
  "tel",
  "select",
  "radio",
  "checkbox",
] as const;

export const TWITTER_CARD_TYPES = [
  "summary",
  "summary_large_image",
  "player",
  "app",
] as const;

// Badge colors admin can choose from
export const BADGE_COLORS = [
  "primary",
  "success",
  "warning",
  "danger",
  "info",
  "neutral",
] as const;

// ✅ Icon options for badges
export const BADGE_ICONS = [
  "",
  "Zap",
  "ShieldCheck",
  "BadgeCheck",
  "Globe",
  "Star",
  "Flame",
  "TrendingUp",
  "Crown",
  "Sparkles",
  "Rocket",
  "Gift",
  "Heart",
  "ThumbsUp",
  "Award",
  "CheckCircle2",
  "Clock",
  "Users",
  "Tag",
  "Percent",
] as const;

export type BadgeColor = (typeof BADGE_COLORS)[number];

export const SEO_LIMITS = {
  TITLE_MAX: 70,
  TITLE_MIN: 30,
  DESC_MAX: 160,
  DESC_MIN: 120,
  KEYWORDS_MAX: 300,
  PRIMARY_KEYWORD_MAX: 80,
  SECONDARY_KEYWORDS_MAX: 300,
  SLUG_MAX: 200,
} as const;

// ==================================================
// HELPERS
// ==================================================
const optionalUrl = z
  .string()
  .url("সঠিক URL দিন (https://...)")
  .optional()
  .or(z.literal(""));

const optionalImageUrl = z
  .string()
  .url("সঠিক image URL দিন")
  .refine(
    (val) => {
      if (!val) return true;
      return /\.(jpe?g|png|webp|avif|gif|svg)(\?.*)?$/i.test(val);
    },
    { message: "Image URL অবশ্যই jpg, png, webp, avif, gif বা svg হতে হবে" }
  )
  .optional()
  .or(z.literal(""));

const optionalText = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

// ==================================================
// VARIATION
// ==================================================
export const variationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variation নাম দিন").max(100),
  sku: z.string().max(50).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price ০ বা বেশি"),
  salePrice: z.coerce
    .number()
    .min(0)
    .optional()
    .nullable()
    .or(z.literal("")),
  costPrice: z.coerce
    .number()
    .min(0)
    .optional()
    .nullable()
    .or(z.literal("")),
  stock: z.coerce.number().int().min(0).optional().nullable().or(z.literal("")),
  unlimitedStock: z.boolean().default(true),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  icon: z.string().max(20).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type VariationInput = z.infer<typeof variationSchema>;

// ==================================================
// DYNAMIC FIELD
// ==================================================
export const fieldOptionSchema = z.object({
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
});

export const productFieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Field label দিন").max(100),
  name: z
    .string()
    .min(1, "Field name দিন")
    .max(50)
    .regex(/^[a-z0-9_]+$/, "শুধু lowercase, number, underscore"),
  fieldType: z.enum(FIELD_TYPES).default("text"),
  placeholder: z.string().max(200).optional().or(z.literal("")),
  helpText: z.string().max(500).optional().or(z.literal("")),
  required: z.boolean().default(true),
  minLength: z.coerce.number().int().min(0).optional().nullable().or(z.literal("")),
  maxLength: z.coerce.number().int().min(0).optional().nullable().or(z.literal("")),
  regex: z.string().max(500).optional().or(z.literal("")),
  defaultValue: z.string().max(200).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  options: z.array(fieldOptionSchema).default([]),
});

export type ProductFieldInput = z.infer<typeof productFieldSchema>;

// ==================================================
// SEO SUB-SCHEMA
// ==================================================
export const seoSchema = z.object({
  seoTitle: z
    .string()
    .max(SEO_LIMITS.TITLE_MAX, `SEO Title ${SEO_LIMITS.TITLE_MAX} character এর বেশি হতে পারবে না`)
    .optional()
    .or(z.literal("")),

  seoDescription: z
    .string()
    .max(SEO_LIMITS.DESC_MAX, `SEO Description ${SEO_LIMITS.DESC_MAX} character এর বেশি হতে পারে না`)
    .optional()
    .or(z.literal("")),

  seoKeywords: z
    .string()
    .max(SEO_LIMITS.KEYWORDS_MAX, `SEO Keywords ${SEO_LIMITS.KEYWORDS_MAX} character এর বেশি হতে পারে না`)
    .optional()
    .or(z.literal("")),

  canonicalUrl: optionalUrl,

  primaryKeyword: z
    .string()
    .max(
      SEO_LIMITS.PRIMARY_KEYWORD_MAX,
      `Primary Keyword ${SEO_LIMITS.PRIMARY_KEYWORD_MAX} character এর বেশি হতে পারে না`
    )
    .optional()
    .or(z.literal("")),

  secondaryKeywords: z
    .string()
    .max(
      SEO_LIMITS.SECONDARY_KEYWORDS_MAX,
      `Secondary Keywords ${SEO_LIMITS.SECONDARY_KEYWORDS_MAX} character এর বেশি হতে পারে না`
    )
    .optional()
    .or(z.literal("")),

  ogTitle: z
    .string()
    .max(SEO_LIMITS.TITLE_MAX, `OG Title ${SEO_LIMITS.TITLE_MAX} character এর বেশি হতে পারে না`)
    .optional()
    .or(z.literal("")),

  ogDescription: z
    .string()
    .max(SEO_LIMITS.DESC_MAX, `OG Description ${SEO_LIMITS.DESC_MAX} character এর বেশি হতে পারে না`)
    .optional()
    .or(z.literal("")),

  ogImage: optionalImageUrl,

  twitterCard: z.enum(TWITTER_CARD_TYPES).default("summary_large_image"),

  twitterImage: optionalImageUrl,

  isIndexable: z.boolean().default(true),

  isFollowable: z.boolean().default(true),

  breadcrumbLabel: z
    .string()
    .max(80, "Breadcrumb label ৮০ character এর বেশি হতে পারে না")
    .optional()
    .or(z.literal("")),
});

// ==================================================
// MAIN PRODUCT
// ==================================================
export const productSchema = z
  .object({
    // ---- Basic ----
    name: z.string().min(2, "নাম কমপক্ষে ২ character").max(200),
    slug: z
      .string()
      .min(2)
      .max(SEO_LIMITS.SLUG_MAX)
      .regex(/^[a-z0-9-]+$/, "শুধু lowercase, number, hyphen"),
    sku: z.string().max(50).optional().or(z.literal("")),

    // ---- Category & Brand ----
    categoryId: z.string().optional().or(z.literal("")),
    brand: z.string().max(100).optional().or(z.literal("")),
    productType: z.enum(PRODUCT_TYPES).default("TOPUP"),

    // ---- Descriptions ----
    shortDesc: z.string().max(500).optional().or(z.literal("")),
    fullDesc: z.string().max(10000).optional().or(z.literal("")),

    // ---- Images ----
    thumbnail: z.string().optional().or(z.literal("")),
    icon: z.string().max(50).optional().or(z.literal("")),

    // ---- Base price ----
    price: z.coerce.number().min(0).default(0),
    currency: z.string().default("BDT"),

    // ---- Status ----
    status: z.enum(PRODUCT_STATUSES).default("DRAFT"),
    isFeatured: z.boolean().default(false),
    isPopular: z.boolean().default(false),
    isNew: z.boolean().default(true),

    // ---- Delivery ----
    deliveryType: z.enum(DELIVERY_TYPES).default("MANUAL"),
    checkoutMode: z.enum(CHECKOUT_MODES).default("DIRECT"),

    // ---- Content ----
    instructions: z.string().max(5000).optional().or(z.literal("")),
    terms: z.string().max(5000).optional().or(z.literal("")),

    // ---- Dynamic Badges ----
    badge1Text: z.string().max(20).optional().or(z.literal("")),
    badge1Icon: z.string().max(30).optional().or(z.literal("")),
    badge1Color: z.enum(BADGE_COLORS).optional().or(z.literal("")),
    badge2Text: z.string().max(20).optional().or(z.literal("")),
    badge2Icon: z.string().max(30).optional().or(z.literal("")),
    badge2Color: z.enum(BADGE_COLORS).optional().or(z.literal("")),
    badge3Text: z.string().max(20).optional().or(z.literal("")),
    badge3Icon: z.string().max(30).optional().or(z.literal("")),
    badge3Color: z.enum(BADGE_COLORS).optional().or(z.literal("")),

    // ---- Relations ----
    variations: z.array(variationSchema).min(1, "কমপক্ষে ১টা variation লাগবে"),
    fields: z.array(productFieldSchema).default([]),
  })
  .merge(seoSchema);

export type ProductInput = z.infer<typeof productSchema>;

// ==================================================
// HELPERS
// ==================================================
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateFieldName(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/[\s]+/g, "_");
}

export function normalizeKeywords(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0)
    .filter((k, i, arr) => arr.indexOf(k) === i);
}

export function getCharStatus(
  current: number,
  max: number
): "empty" | "good" | "warn" | "over" {
  if (current === 0) return "empty";
  if (current > max) return "over";
  if (current > max * 0.9) return "warn";
  return "good";
}