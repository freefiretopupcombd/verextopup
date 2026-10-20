import { z } from "zod";

// ==================================================
// ORDER SCHEMAS
// ==================================================
// Security:
//   - Quantity bounded (1-100)
//   - paymentFields limited
//   - Product fields limited
// ==================================================

// Product input fields (user-provided) — max 20 fields
const productFieldsSchema = z
  .record(z.string().max(100), z.string().max(500))
  .refine((obj) => Object.keys(obj).length <= 20, {
    message: "সর্বোচ্চ ২০টি field পাঠানো যাবে",
  });

const paymentFieldsSchema = z
  .record(z.string().max(100), z.string().max(500))
  .refine((obj) => Object.keys(obj).length <= 20, {
    message: "সর্বোচ্চ ২০টি payment field পাঠানো যাবে",
  });

export const checkoutSchema = z.object({
  variantId: z.string().min(1).max(100),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity কমপক্ষে ১")
    .max(100, "Quantity সর্বোচ্চ ১০০"),
  paymentMethodId: z.string().min(1).max(100),
  fields: productFieldsSchema,
  customerNote: z
    .string()
    .max(500, "Note সর্বোচ্চ ৫০০ character")
    .optional()
    .or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ==================================================
// PAYMENT SUBMISSION
// ==================================================
export const paymentSubmissionSchema = z.object({
  orderId: z.string().min(1).max(100),
  paymentMethodId: z.string().min(1).max(100),
  fields: paymentFieldsSchema,
  customerNote: z
    .string()
    .max(500, "Note সর্বোচ্চ ৫০০ character")
    .optional()
    .or(z.literal("")),
});

export type PaymentSubmissionInput = z.infer<
  typeof paymentSubmissionSchema
>;