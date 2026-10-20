import { z } from "zod";

export const BLOG_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "SCHEDULED",
  "ARCHIVED",
] as const;

export const blogPostSchema = z.object({
  title: z.string().min(3, "Title কমপক্ষে ৩ character").max(200),
  slug: z
    .string()
    .min(3, "Slug কমপক্ষে ৩ character")
    .max(220)
    .regex(/^[a-z0-9-]+$/, "শুধু lowercase, number, hyphen"),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(20, "Content কমপক্ষে ২০ character"),
  featuredImage: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")), // Comma-separated
  status: z.enum(BLOG_STATUSES).default("DRAFT"),
  publishedAt: z.string().optional().or(z.literal("")),
  scheduledFor: z.string().optional().or(z.literal("")),
  readTime: z.coerce.number().int().min(1).max(120).default(5),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(200).optional().or(z.literal("")),
  seoDescription: z.string().max(500).optional().or(z.literal("")),
  seoKeywords: z.string().max(300).optional().or(z.literal("")),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const blogCategorySchema = z.object({
  name: z.string().min(2, "Name কমপক্ষে ২ character").max(100),
  slug: z
    .string()
    .min(2, "Slug কমপক্ষে ২ character")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "শুধু lowercase, number, hyphen"),
  description: z.string().max(500).optional().or(z.literal("")),
  color: z.string().max(20).default("#7C3AED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}