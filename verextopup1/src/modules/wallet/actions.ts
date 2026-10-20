"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { notifyTopUpApproved } from "@/modules/notifications/hooks";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import {
  rateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";
import {
  walletTopUpSchema,
  generateTopUpReference,
} from "./validations";

export type ActionState = {
  success: boolean;
  message?: string;
  referenceNumber?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// CREATE WALLET TOP-UP (fully dynamic fields)
// ==================================================
export async function createWalletTopUpAction(
  formData: FormData
): Promise<ActionState> {
  // ---- AUTH ----
  let session;
  try {
    session = await requireAuth("/account/wallet");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  // ---- RATE LIMIT (per user, per IP) ----
  // Wallet top-up abuse prevention:
  //   - Per user: 10 requests/hour (prevents spam)
  //   - Per IP: 10 requests/hour (prevents multi-account abuse)
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const userLimit = await rateLimit(
    "wallet-topup-user",
    userId,
    RATE_LIMITS.WALLET_TOPUP
  );
  if (!userLimit.success) {
    return rateLimitResponse(userLimit.retryAfter);
  }

  const ipLimit = await rateLimit(
    "wallet-topup-ip",
    ip,
    RATE_LIMITS.WALLET_TOPUP
  );
  if (!ipLimit.success) {
    return rateLimitResponse(ipLimit.retryAfter);
  }

  // ---- PARSE FIELDS ----
  const paymentFieldsRaw = formData.get("paymentFields") as string;
  let paymentFields: Record<string, string> = {};
  try {
    paymentFields = JSON.parse(paymentFieldsRaw || "{}");
  } catch {
    paymentFields = {};
  }

  const parsed = walletTopUpSchema.safeParse({
    amount: formData.get("amount"),
    paymentMethodId: formData.get("paymentMethodId"),
    paymentFields,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { amount, paymentMethodId } = parsed.data;

  try {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod || paymentMethod.status !== "ACTIVE") {
      return { success: false, message: "Payment method invalid" };
    }

    // Get method fields (admin-defined)
    const methodFields: any[] = Array.isArray(paymentMethod.inputFields)
      ? (paymentMethod.inputFields as any[])
      : [];

    // Validate required fields
    for (const field of methodFields) {
      if (field.required && !paymentFields[field.name]?.trim()) {
        return {
          success: false,
          message: `${field.label} দিতে হবে`,
        };
      }
    }

    // Extract special fields using ROLE (fallback to name matching)
    let senderNumber: string | null = null;
    let txnId: string | null = null;

    for (const field of methodFields) {
      const value = paymentFields[field.name]?.trim();
      if (!value) continue;

      if (field.role === "SENDER_NUMBER" && !senderNumber) {
        senderNumber = value;
      }
      if (field.role === "TRANSACTION_ID" && !txnId) {
        txnId = value;
      }
    }

    // Fallback: name-based matching
    if (!senderNumber) {
      senderNumber =
        paymentFields.mobile_number?.trim() ||
        paymentFields.sender_number?.trim() ||
        paymentFields.sender?.trim() ||
        paymentFields.phone?.trim() ||
        null;
    }
    if (!txnId) {
      txnId =
        paymentFields.transaction_id?.trim() ||
        paymentFields.transactionId?.trim() ||
        paymentFields.txn_id?.trim() ||
        paymentFields.trx_id?.trim() ||
        null;
    }

    // Check duplicate transaction ID
    if (txnId) {
      const existing = await prisma.walletTopUp.findFirst({
        where: { transactionId: txnId },
      });
      if (existing) {
        return {
          success: false,
          message: "এই Transaction ID আগেই ব্যবহার হয়েছে",
        };
      }
    }

    const paymentMethodSnapshot = {
      id: paymentMethod.id,
      name: paymentMethod.name,
      slug: paymentMethod.slug,
      logo: paymentMethod.logo,
      accountNumber: paymentMethod.accountNumber,
      merchantNumber: paymentMethod.merchantNumber,
      instructions: paymentMethod.instructions,
      inputFields: methodFields,
      snapshottedAt: new Date().toISOString(),
    };

    // ==================================================
    // Create top-up + ALL fields (dynamic)
    // ==================================================
    const topUp = await prisma.walletTopUp.create({
      data: {
        referenceNumber: generateTopUpReference(),
        userId,
        amount,
        currency: "BDT",
        paymentMethodId: paymentMethod.id,
        paymentMethodSnapshot,
        senderNumber,
        transactionId: txnId,
        status: "AWAITING_VERIFICATION",
        fields: {
          create: methodFields
            .map((field) => {
              const value = paymentFields[field.name]?.trim();
              if (!value) return null;
              return {
                fieldName: field.name,
                fieldLabel: field.label,
                fieldValue: value,
                fieldRole: field.role || "NONE",
              };
            })
            .filter((f): f is NonNullable<typeof f> => f !== null),
        },
      },
    });

    revalidatePath("/account/wallet");
    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Top-up request সফলভাবে submit হয়েছে!",
      referenceNumber: topUp.referenceNumber,
    };
  } catch (error) {
    console.error("Create wallet topup error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// ADMIN — APPROVE
// ==================================================
export async function approveTopUpAction(
  topUpId: string,
  adminNote?: string
) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  try {
    const topUp = await prisma.walletTopUp.findUnique({
      where: { id: topUpId },
    });

    if (!topUp) return { success: false, message: "Top-up পাওয়া যায়নি" };
    if (topUp.status === "APPROVED")
      return { success: false, message: "আগেই approved" };

    await prisma.$transaction(async (tx) => {
      await tx.walletTopUp.update({
        where: { id: topUpId },
        data: {
          status: "APPROVED",
          verifiedBy: adminId,
          verifiedAt: new Date(),
          adminNote: adminNote || null,
        },
      });

      let wallet = await tx.wallet.findUnique({
        where: { userId: topUp.userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: topUp.userId,
            balance: 0,
            currency: "BDT",
          },
        });
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + Number(topUp.amount);

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: topUp.userId,
          type: "CREDIT",
          amount: topUp.amount,
          balanceBefore,
          balanceAfter,
          reason: "TOPUP",
          reference: topUp.referenceNumber,
          note: `Wallet top-up via ${(topUp.paymentMethodSnapshot as any)?.name || "Unknown"}`,
          status: "COMPLETED",
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: "wallet_topup.approved",
          targetType: "WalletTopUp",
          targetId: topUpId,
          newValue: { amount: Number(topUp.amount), userId: topUp.userId },
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/account/wallet");
    revalidatePath("/account/notifications");

    await notifyTopUpApproved(
      topUp.userId,
      Number(topUp.amount),
      topUp.referenceNumber
    );

    return {
      success: true,
      message: `৳${Number(topUp.amount).toFixed(2)} wallet-এ যোগ হয়েছে`,
    };
  } catch (error) {
    console.error("Approve topup error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — REJECT
// ==================================================
export async function rejectTopUpAction(topUpId: string, reason: string) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  try {
    const topUp = await prisma.walletTopUp.findUnique({
      where: { id: topUpId },
    });

    if (!topUp) return { success: false, message: "Top-up পাওয়া যায়নি" };

    await prisma.$transaction(async (tx) => {
      await tx.walletTopUp.update({
        where: { id: topUpId },
        data: {
          status: "REJECTED",
          verifiedBy: adminId,
          verifiedAt: new Date(),
          rejectionReason: reason,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: "wallet_topup.rejected",
          targetType: "WalletTopUp",
          targetId: topUpId,
          newValue: { reason },
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/account/wallet");

    return { success: true, message: "Top-up rejected" };
  } catch (error) {
    console.error("Reject topup error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// GET ACTIVE PAYMENT METHODS
// ==================================================
export async function getActivePaymentMethods() {
  const methods = await prisma.paymentMethod.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return methods.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    type: m.type,
    logo: m.logo,
    instructions: m.instructions,
    accountNumber: m.accountNumber,
    merchantNumber: m.merchantNumber,
    inputFields: (m.inputFields as any) || [],
  }));
}