import { z } from "zod";

export const PAYMENT_TYPES = ["MANUAL", "AUTOMATIC"] as const;
export const PAYMENT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export const INPUT_FIELD_TYPES = [
  "text",
  "number",
  "email",
  "tel",
  "textarea",
] as const;

// Custom input field (per payment method)
export const paymentInputFieldSchema = z.object({
  label: z.string().min(1, "Label দিন").max(100),
  name: z
    .string()
    .min(1, "Field name দিন")
    .max(50)
    .regex(/^[a-z0-9_]+$/, "শুধু lowercase, number, underscore"),
  fieldType: z.enum(INPUT_FIELD_TYPES).default("text"),
  placeholder: z.string().max(200).optional().or(z.literal("")),
  helpText: z.string().max(500).optional().or(z.literal("")),
  required: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type PaymentInputField = z.infer<typeof paymentInputFieldSchema>;

export const paymentMethodSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ character").max(100),
  slug: z
    .string()
    .min(2, "Slug কমপক্ষে ২ character")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "শুধু lowercase, number, hyphen"),
  type: z.enum(PAYMENT_TYPES).default("MANUAL"),
  logo: z.string().optional().or(z.literal("")),
  accountNumber: z.string().max(100).optional().or(z.literal("")),
  merchantNumber: z.string().max(100).optional().or(z.literal("")),
  instructions: z.string().max(2000).optional().or(z.literal("")),
  requireTxnId: z.boolean().default(true),
  requireScreenshot: z.boolean().default(false),
  minAmount: z.coerce.number().min(0).optional().nullable().or(z.literal("")),
  maxAmount: z.coerce.number().min(0).optional().nullable().or(z.literal("")),
  status: z.enum(PAYMENT_STATUSES).default("ACTIVE"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  inputFields: z.array(paymentInputFieldSchema).default([]),
});

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

export function generatePaymentSlug(name: string): string {
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