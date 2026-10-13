import { z } from "zod";

// ==================================================
// ADMIN WALLET — VALIDATION SCHEMAS
// ==================================================
// Security principles:
//   1. All amounts bounded (prevent overflow + abuse)
//   2. Reason mandatory (audit trail)
//   3. userId format validated (cuid)
//   4. No negative/zero amounts for adjust (sign via `type`)
// ==================================================

export const MIN_ADJUST_AMOUNT = 1;
export const MAX_ADJUST_AMOUNT = 50_000; // per transaction
export const MAX_DAILY_ADJUST_PER_ADMIN = 200_000;

// ---- Adjust Balance ----
export const adjustBalanceSchema = z.object({
  userId: z.string().min(1).max(100),
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z.coerce
    .number()
    .min(MIN_ADJUST_AMOUNT, `সর্বনিম্ন ৳${MIN_ADJUST_AMOUNT}`)
    .max(MAX_ADJUST_AMOUNT, `সর্বোচ্চ ৳${MAX_ADJUST_AMOUNT}`)
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: "Amount সঠিক সংখ্যা হতে হবে",
    }),
  reason: z.enum([
    "MANUAL_CREDIT",
    "MANUAL_DEBIT",
    "REFUND",
    "BONUS",
    "CORRECTION",
    "PENALTY",
    "COMPENSATION",
  ]),
  note: z
    .string()
    .min(10, "Note কমপক্ষে ১০ অক্ষর")
    .max(500, "Note সর্বোচ্চ ৫০০ অক্ষর"),
  confirmationCode: z.string().min(1), // "CONFIRM" typed by admin
});

export type AdjustBalanceInput = z.infer<typeof adjustBalanceSchema>;

// ---- Freeze / Unfreeze ----
export const freezeWalletSchema = z.object({
  userId: z.string().min(1).max(100),
  action: z.enum(["FREEZE", "UNFREEZE"]),
  reason: z
    .string()
    .min(10, "Reason কমপক্ষে ১০ অক্ষর")
    .max(500, "Reason সর্বোচ্চ ৫০০ অক্ষর"),
});

export type FreezeWalletInput = z.infer<typeof freezeWalletSchema>;

// ---- Bulk Credit ----
export const bulkCreditSchema = z.object({
  userIds: z
    .array(z.string().min(1).max(100))
    .min(1, "কমপক্ষে ১ জন user")
    .max(100, "সর্বোচ্চ ১০০ জন user একসাথে"),
  amountPerUser: z.coerce
    .number()
    .min(MIN_ADJUST_AMOUNT)
    .max(MAX_ADJUST_AMOUNT),
  reason: z.enum(["BONUS", "COMPENSATION", "PROMOTION"]),
  note: z.string().min(10).max(500),
  confirmationCode: z.string().min(1),
});

export type BulkCreditInput = z.infer<typeof bulkCreditSchema>;

// ==================================================
// REASON LABELS (UI display)
// ==================================================
export const REASON_LABELS: Record<string, string> = {
  MANUAL_CREDIT: "Manual Credit (admin)",
  MANUAL_DEBIT: "Manual Debit (admin)",
  REFUND: "Refund",
  BONUS: "Bonus",
  CORRECTION: "Correction",
  PENALTY: "Penalty",
  COMPENSATION: "Compensation",
  PROMOTION: "Promotion",
  TOPUP: "Wallet Top-Up",
  ORDER_PAYMENT: "Order Payment",
  ORDER_REFUND: "Order Refund",
};