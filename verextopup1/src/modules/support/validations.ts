import { z } from "zod";

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
// CONSTANTS
// ==================================================
export const TICKET_CATEGORIES = [
  { value: "GENERAL", label: "সাধারণ প্রশ্ন" },
  { value: "ORDER", label: "Order সমস্যা" },
  { value: "PAYMENT", label: "Payment সমস্যা" },
  { value: "WALLET", label: "Wallet সমস্যা" },
  { value: "TECHNICAL", label: "Technical সমস্যা" },
  { value: "OTHER", label: "অন্যান্য" },
] as const;

export const TICKET_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
] as const;

// ==================================================
// TICKET SCHEMAS
// ==================================================
export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, "Subject কমপক্ষে ৫ character")
    .max(200, "Subject সর্বোচ্চ ২০০ character")
    .transform(sanitizeText),
  category: z.enum([
    "GENERAL",
    "ORDER",
    "PAYMENT",
    "WALLET",
    "TECHNICAL",
    "OTHER",
  ]),
  orderId: z.string().max(100).optional().nullable(),
  message: z
    .string()
    .min(10, "Message কমপক্ষে ১০ character")
    .max(2000, "সর্বোচ্চ ২০০০ character")
    .transform(sanitizeText),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const replyMessageSchema = z.object({
  ticketId: z.string().min(1).max(100),
  message: z
    .string()
    .min(1, "Message লিখুন")
    .max(2000, "সর্বোচ্চ ২০০০ character")
    .transform(sanitizeText),
  isInternal: z.boolean().default(false),
});

// ==================================================
// CONTACT SCHEMA
// ==================================================
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "নাম কমপক্ষে ২ character")
    .max(100, "নাম সর্বোচ্চ ১০০ character")
    .transform(sanitizeText),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(255)
    .email("সঠিক email দিন"),
  phone: z
    .string()
    .max(20, "Phone number সর্বোচ্চ ২০ character")
    .regex(/^[0-9+\-\s()]*$/, "Phone number এ শুধু digits, +, -, (), space")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .min(3, "Subject দিন")
    .max(200, "Subject সর্বোচ্চ ২০০ character")
    .transform(sanitizeText),
  message: z
    .string()
    .min(10, "Message কমপক্ষে ১০ character")
    .max(2000, "সর্বোচ্চ ২০০০ character")
    .transform(sanitizeText),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ==================================================
// HELPERS
// ==================================================
export function generateTicketNo(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${y}${m}${d}-${rand}`;
}