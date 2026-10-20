import { z } from "zod";

import { LAYOUT_TYPES, SOURCE_TYPES } from "./types";

// ==================================================
// XSS PREVENTION
// ==================================================
function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

// ==================================================
// SECTION SCHEMA
// ==================================================
export const homepageSectionSchema = z
  .object({
    title: z
      .string()
      .min(2, "Title কমপক্ষে ২ character")
      .max(100, "Title সর্বোচ্চ ১০০ character")
      .transform(sanitizeText),

    subtitle: z
      .string()
      .max(300, "Subtitle সর্বোচ্চ ৩০০ character")
      .transform(sanitizeText)
      .optional()
      .or(z.literal("")),

    layoutType: z.enum(LAYOUT_TYPES).default("GRID"),
    sourceType: z.enum(SOURCE_TYPES).default("MANUAL"),

    sourceCategoryId: z
      .string()
      .max(100)
      .optional()
      .or(z.literal("")),

    itemLimit: z.coerce
      .number()
      .int()
      .min(1, "কমপক্ষে ১")
      .max(24, "সর্বোচ্চ ২৪")
      .default(8),

    mobileColumns: z.coerce
      .number()
      .int()
      .min(1, "কমপক্ষে ১")
      .max(3, "সর্বোচ্চ ৩")
      .default(2),

    desktopColumns: z.coerce
      .number()
      .int()
      .min(2, "কমপক্ষে ২")
      .max(6, "সর্বোচ্চ ৬")
      .default(4),

    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).max(100).default(0),

    viewAllUrl: z
      .string()
      .max(200)
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => {
          if (!val) return true;
          return val.startsWith("/") || val.startsWith("http");
        },
        { message: "URL অবশ্যই / অথবা http(s) দিয়ে শুরু" }
      ),

    viewAllText: z
      .string()
      .max(40)
      .transform(sanitizeText)
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.sourceType === "CATEGORY" && !data.sourceCategoryId) {
        return false;
      }
      return true;
    },
    {
      message: "Category select করুন",
      path: ["sourceCategoryId"],
    }
  );

export type HomepageSectionInput = z.infer<typeof homepageSectionSchema>;

export const manualProductsSchema = z.object({
  productIds: z
    .array(z.string().min(1).max(100))
    .max(50, "সর্বোচ্চ ৫০টি product")
    .default([]),
});

export type ManualProductsInput = z.infer<typeof manualProductsSchema>;