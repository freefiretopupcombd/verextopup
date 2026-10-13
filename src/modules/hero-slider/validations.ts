import { z } from "zod";

// ==================================================
// XSS PREVENTION HELPER
// ==================================================
// Strips HTML tags and dangerous characters from user input.
// Defense-in-depth: even if rendered as raw HTML, no script runs.
// ==================================================
function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>]/g, "") // strip remaining angle brackets
    .trim();
}

// ==================================================
// CONSTANTS
// ==================================================
export const BUTTON_STYLES = ["primary", "outline", "ghost"] as const;

export const BADGE_ICONS = [
  "Zap",
  "Flame",
  "Star",
  "Award",
  "ShieldCheck",
  "TrendingUp",
  "Gift",
  "Sparkles",
  "Crown",
  "Rocket",
] as const;

export const CTA_ICONS = [
  "ShoppingBag",
  "ArrowRight",
  "Zap",
  "Gift",
  "Star",
  "Sparkles",
  "Play",
  "Rocket",
] as const;

// ==================================================
// VALIDATION SCHEMA
// ==================================================
export const heroSlideSchema = z
  .object({
    // ---- Content ----
    title: z
      .string()
      .min(3, "Title কমপক্ষে ৩ character")
      .max(120, "Title সর্বোচ্চ ১২০ character")
      .transform(sanitizeText),

    subtitle: z
      .string()
      .max(200, "Subtitle সর্বোচ্চ ২০০ character")
      .transform(sanitizeText)
      .optional()
      .or(z.literal("")),

    description: z
      .string()
      .max(500, "Description সর্বোচ্চ ৫০০ character")
      .transform(sanitizeText)
      .optional()
      .or(z.literal("")),

    badgeText: z
      .string()
      .max(60, "Badge text সর্বোচ্চ ৬০ character")
      .transform(sanitizeText)
      .optional()
      .or(z.literal("")),

    badgeIcon: z.enum(BADGE_ICONS).optional().or(z.literal("")),

    // ---- Visual ----
    image: z
      .string()
      .url("সঠিক image URL দিন")
      .max(500, "URL সর্বোচ্চ ৫০০ character")
      .refine(
        (val) => {
          if (!val) return true;
          return /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(val);
        },
        { message: "Image অবশ্যই jpg, png, webp, avif বা gif হতে হবে" }
      ),

    imageMobile: z
      .string()
      .url("সঠিক mobile image URL দিন")
      .max(500)
      .refine(
        (val) => {
          if (!val) return true;
          return /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(val);
        },
        { message: "Mobile image অবশ্যই jpg, png, webp, avif বা gif হতে হবে" }
      )
      .optional()
      .or(z.literal("")),

    // ---- CTA 1 ----
    button1Text: z
      .string()
      .max(40, "Button text সর্বোচ্চ ৪০ character")
      .transform(sanitizeText)
      .optional()
      .or(z.literal("")),

    button1Url: z
      .string()
      .max(500)
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => {
          if (!val) return true;
          return val.startsWith("/") || val.startsWith("http");
        },
        { message: "URL অবশ্যই / দিয়ে শুরু হবে অথবা http(s) full URL" }
      ),

    button1Icon: z.enum(CTA_ICONS).optional().or(z.literal("")),

    button1Style: z.enum(BUTTON_STYLES).default("primary"),

    // ---- CTA 2 ----
    button2Text: z
      .string()
      .max(40)
      .transform(sanitizeText)
      .optional()
      .or(z.literal("")),

    button2Url: z
      .string()
      .max(500)
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => {
          if (!val) return true;
          return val.startsWith("/") || val.startsWith("http");
        },
        { message: "URL অবশ্যই / দিয়ে শুরু হবে অথবা http(s) full URL" }
      ),

    button2Icon: z.enum(CTA_ICONS).optional().or(z.literal("")),

    // ---- Overlay & Colors ----
    overlayColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "সঠিক hex color দিন (যেমন #000000)")
      .default("#000000"),

    overlayOpacity: z.coerce
      .number()
      .int()
      .min(0, "Opacity কমপক্ষে ০")
      .max(100, "Opacity সর্বোচ্চ ১০০")
      .default(60),

    textColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "সঠিক hex color দিন")
      .default("#FFFFFF"),

    accentColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "সঠিক hex color দিন")
      .default("#7C3AED"),

    // ---- Behavior ----
    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).default(0),
    openInNewTab: z.boolean().default(false),

    // ---- Scheduling ----
    startAt: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => {
          if (!val) return true;
          return !isNaN(new Date(val).getTime());
        },
        { message: "সঠিক date দিন" }
      ),

    endAt: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => {
          if (!val) return true;
          return !isNaN(new Date(val).getTime());
        },
        { message: "সঠিক date দিন" }
      ),
  })
  .refine(
    (data) => {
      // End date must be after start date
      if (!data.startAt || !data.endAt) return true;
      return new Date(data.endAt) > new Date(data.startAt);
    },
    {
      message: "End date অবশ্যই start date এর পরে হতে হবে",
      path: ["endAt"],
    }
  )
  .refine(
    (data) => {
      // If button text given, URL must be given
      if (data.button1Text && !data.button1Url) {
        return false;
      }
      return true;
    },
    {
      message: "Button text দিলে URL দিতে হবে",
      path: ["button1Url"],
    }
  )
  .refine(
    (data) => {
      if (data.button2Text && !data.button2Url) {
        return false;
      }
      return true;
    },
    {
      message: "Button text দিলে URL দিতে হবে",
      path: ["button2Url"],
    }
  );

export type HeroSlideInput = z.infer<typeof heroSlideSchema>;