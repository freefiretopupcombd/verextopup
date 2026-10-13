import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "নাম কমপক্ষে ২ character")
    .max(100, "নাম অনেক বড়"),
  slug: z
    .string()
    .min(2, "Slug কমপক্ষে ২ character")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "শুধু lowercase, number, এবং hyphen"),
  description: z
    .string()
    .max(1000, "Description অনেক বড়")
    .optional()
    .or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  icon: z.string().max(50).optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(200).optional().or(z.literal("")),
  seoDescription: z
    .string()
    .max(500)
    .optional()
    .or(z.literal("")),
  seoKeywords: z.string().max(300).optional().or(z.literal("")),

  // Add to existing categorySchema
showOnHomepage: z.boolean().default(true),
homepageOrder: z.coerce.number().int().min(0).default(0),
homepageTag: z
  .string()
  .max(30)
  .optional()
  .or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Utility: Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


