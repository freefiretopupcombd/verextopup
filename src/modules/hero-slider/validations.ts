import { z } from "zod";

// ==================================================
// IMAGE URL VALIDATION
// ==================================================
function isValidImageUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(url);
  } catch {
    return false;
  }
  if (url.includes("cloudinary.com")) return true;
  if (/\.(jpe?g|png|webp|avif|gif|svg)(\?.*)?$/i.test(url)) return true;
  return false;
}

// ==================================================
// VALIDATION SCHEMA (SIMPLIFIED)
// ==================================================
export const heroSlideSchema = z.object({
  image: z
    .string()
    .url("সঠিক image URL দিন")
    .max(500)
    .refine(isValidImageUrl, {
      message: "Image URL অবশ্যই jpg, png, webp, avif, gif হতে হবে অথবা Cloudinary URL হতে হবে",
    }),
  imageMobile: z
    .string()
    .url("সঠিক mobile image URL দিন")
    .max(500)
    .refine(isValidImageUrl, {
      message: "Mobile image URL অবশ্যই jpg, png, webp, avif, gif হতে হবে অথবা Cloudinary URL হতে হবে",
    })
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type HeroSlideInput = z.infer<typeof heroSlideSchema>;