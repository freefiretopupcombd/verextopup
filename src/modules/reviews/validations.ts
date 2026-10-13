import { z } from "zod";

// ==================================================
// XSS PREVENTION HELPER
// ==================================================
// Strips HTML tags and dangerous characters from user input.
// Even though React auto-escapes JSX, this provides defense-in-depth.
// If content is ever rendered as raw HTML (admin panel, PDF export),
// it stays safe.
// ==================================================
function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>]/g, "") // strip remaining angle brackets
    .trim();
}

// ==================================================
// REVIEW
// ==================================================
export const reviewSchema = z.object({
  productId: z.string().min(1).max(100),
  orderId: z.string().max(100).optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z
    .string()
    .max(200, "Title সর্বোচ্চ ২০০ character")
    .transform(sanitizeText)
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(10, "কমপক্ষে ১০ character লিখুন")
    .max(2000, "সর্বোচ্চ ২০০০ character")
    .transform(sanitizeText),
  imageUrl: z
    .string()
    .url("সঠিক image URL দিন")
    .max(500)
    .refine(
      (val) => {
        if (!val) return true;
        return /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(val);
      },
      { message: "Image অবশ্যই jpg, png, webp, avif বা gif হতে হবে" }
    )
    .optional()
    .or(z.literal("")),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// ==================================================
// REVIEW REPLY (admin)
// ==================================================
export const replySchema = z.object({
  reviewId: z.string().min(1).max(100),
  content: z
    .string()
    .min(2, "Reply লিখুন")
    .max(1000, "সর্বোচ্চ ১০০০ character")
    .transform(sanitizeText),
});

export type ReplyInput = z.infer<typeof replySchema>;