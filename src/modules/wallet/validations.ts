import { z } from "zod";

// ==================================================
// WALLET TOP-UP
// ==================================================
// Security:
//   - Amount bounds (DoS + business logic)
//   - paymentFields key/value length limits
//   - Max number of fields
// ==================================================

export const MIN_TOPUP = 50;
export const MAX_TOPUP = 100000;

export const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

// paymentFields: Record<string, string>
// - Max 20 fields
// - Each key max 100 char
// - Each value max 500 char
const paymentFieldsSchema = z
  .record(
    z.string().max(100),   // key limit
    z.string().max(500)    // value limit
  )
  .refine(
    (obj) => Object.keys(obj).length <= 20,
    { message: "সর্বোচ্চ ২০টি field পাঠানো যাবে" }
  );

export const walletTopUpSchema = z.object({
  amount: z.coerce
    .number()
    .min(MIN_TOPUP, `সর্বনিম্ন ৳${MIN_TOPUP}`)
    .max(MAX_TOPUP, `সর্বোচ্চ ৳${MAX_TOPUP}`)
    .refine((val) => Number.isFinite(val), {
      message: "Amount একটি সঠিক সংখ্যা হতে হবে",
    }),
  paymentMethodId: z.string().min(1).max(100),
  paymentFields: paymentFieldsSchema,
});

export type WalletTopUpInput = z.infer<typeof walletTopUpSchema>;

export function generateTopUpReference(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `WT-${y}${m}${d}-${rand}`;
}