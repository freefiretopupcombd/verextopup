import { z } from "zod";

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "AWAITING_DELIVERY",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "ON_HOLD",
  "AWAITING_VERIFICATION",
] as const;

export const PAYMENT_STATUSES = [
  "UNPAID",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const DELIVERY_STATUSES = [
  "PENDING",
  "PROCESSING",
  "DELIVERED",
  "FAILED",
] as const;

// Update order status
export const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(500).optional().or(z.literal("")),
  notifyCustomer: z.boolean().default(false),
});

// Approve payment
export const approvePaymentSchema = z.object({
  orderId: z.string().min(1),
  adminNote: z.string().max(500).optional().or(z.literal("")),
  markAsPaid: z.boolean().default(true),
});

// Reject payment
export const rejectPaymentSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(5, "কারণ দিন").max(500),
});

// Refund
export const refundSchema = z.object({
  orderId: z.string().min(1),
  amount: z.coerce.number().min(0.01, "Amount দিতে হবে"),
  reason: z.string().min(3, "কারণ দিন").max(500),
  refundToWallet: z.boolean().default(true),
});

// Internal note
export const internalNoteSchema = z.object({
  orderId: z.string().min(1),
  note: z.string().min(1, "Note দিন").max(2000),
});

// Manual delivery
export const manualDeliverySchema = z.object({
  orderId: z.string().min(1),
  deliveryCode: z.string().max(500).optional().or(z.literal("")),
  deliveryNote: z.string().max(2000).optional().or(z.literal("")),
});

// Order filters
export const orderFilterSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentMethodId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
});