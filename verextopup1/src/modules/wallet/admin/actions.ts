"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin, getSession } from "@/lib/auth/session";
import {
  rateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";
import {
  notifyWalletCredited,
  notifyWalletDebited,
} from "@/modules/notifications/hooks";
import {
  adjustBalanceSchema,
  freezeWalletSchema,
  bulkCreditSchema,
  MAX_ADJUST_AMOUNT,
  MAX_DAILY_ADJUST_PER_ADMIN,
} from "./validations";

export type AdminActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
};

// ==================================================
// INTERNAL: Require SUPER_ADMIN
// ==================================================
async function requireSuperAdmin() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  const role = (session.user as any).role;
  if (role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN_SUPER_ADMIN_REQUIRED");
  }
  return session;
}

// ==================================================
// INTERNAL: Audit log helper
// ==================================================
async function logAudit(opts: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: any;
  newValue?: any;
  ip?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: opts.actorId,
      actorType: "ADMIN",
      action: opts.action,
      targetType: opts.targetType,
      targetId: opts.targetId,
      oldValue: opts.oldValue ?? undefined,
      newValue: opts.newValue ?? undefined,
      ipAddress: opts.ip,
      userAgent: opts.userAgent,
    },
  });
}

// ==================================================
// ADJUST BALANCE (Manual Credit/Debit)
// ==================================================
// SECURITY:
//   1. SUPER_ADMIN only
//   2. Rate limited (30 / hour)
//   3. Amount bounded (max 50,000)
//   4. Daily limit per admin (200,000)
//   5. Cannot adjust own wallet
//   6. Confirmation code "CONFIRM" typed
//   7. Race-safe: transaction + balance check
//   8. Audit log mandatory
//   9. Notification sent to user
// ==================================================
export async function adjustBalanceAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  // ---- 1. Auth (SUPER_ADMIN) ----
  let session;
  try {
    session = await requireSuperAdmin();
  } catch (e: any) {
    if (e.message === "FORBIDDEN_SUPER_ADMIN_REQUIRED") {
      return { success: false, message: "শুধু SUPER_ADMIN এই কাজ করতে পারবে" };
    }
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  // ---- 2. Rate limit ----
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const userAgent = headersList.get("user-agent") || "unknown";

  const limit = await rateLimit(
    "admin-wallet-adjust",
    adminId,
    { limit: 30, windowMs: 60 * 60 * 1000 } // 30/hour
  );
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfter) as AdminActionState;
  }

  // ---- 3. Parse + Validate ----
  const parsed = adjustBalanceSchema.safeParse({
    userId: formData.get("userId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
    note: formData.get("note"),
    confirmationCode: formData.get("confirmationCode"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  // ---- 4. Confirmation code check ----
  if (data.confirmationCode.trim().toUpperCase() !== "CONFIRM") {
    return {
      success: false,
      message: 'নিশ্চিত করতে "CONFIRM" টাইপ করুন',
    };
  }

  // ---- 5. Cannot adjust own wallet ----
  if (data.userId === adminId) {
    return {
      success: false,
      message: "নিজের wallet adjust করতে পারবেন না",
    };
  }

  // ---- 6. Daily limit check ----
  if (data.type === "CREDIT") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayAgg = await prisma.walletTransaction.aggregate({
      where: {
        adminId,
        type: "CREDIT",
        reason: {
          in: ["MANUAL_CREDIT", "BONUS", "COMPENSATION", "PROMOTION"],
        },
        createdAt: { gte: startOfToday },
      },
      _sum: { amount: true },
    });

    const todayTotal = Number(todayAgg._sum.amount || 0);
    if (todayTotal + data.amount > MAX_DAILY_ADJUST_PER_ADMIN) {
      return {
        success: false,
        message: `আজকের limit শেষ। (৳${MAX_DAILY_ADJUST_PER_ADMIN.toLocaleString()} max/day)`,
      };
    }
  }

  // ---- 7. Execute in transaction ----
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 7a. Load wallet with lock
      const wallet = await tx.wallet.findUnique({
        where: { userId: data.userId },
        include: {
          user: {
            select: { id: true, email: true, name: true, status: true },
          },
        },
      });

      if (!wallet) throw new Error("WALLET_NOT_FOUND");
      if (wallet.status === "FROZEN") throw new Error("WALLET_FROZEN");
      if (wallet.user.status === "BANNED") throw new Error("USER_BANNED");

      const balanceBefore = Number(wallet.balance);
      const amount = data.amount;
      const balanceAfter =
        data.type === "CREDIT"
          ? balanceBefore + amount
          : balanceBefore - amount;

      // 7b. Prevent negative balance
      if (balanceAfter < 0) throw new Error("INSUFFICIENT_BALANCE");

      // 7c. Atomic balance update (conditional on current balance to prevent race)
      const updated = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          balance: wallet.balance, // ensure no concurrent change
        },
        data: { balance: balanceAfter },
      });

      if (updated.count === 0) {
        throw new Error("CONCURRENT_MODIFICATION");
      }

      // 7d. Create transaction record
      const txn = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: data.userId,
          type: data.type,
          amount,
          balanceBefore,
          balanceAfter,
          reason: data.reason,
          note: data.note,
          adminId,
          status: "COMPLETED",
        },
      });

      return {
        wallet,
        txn,
        balanceBefore,
        balanceAfter,
        amount,
      };
    });

    // ---- 8. Audit log ----
    await logAudit({
      actorId: adminId,
      action: `wallet.${data.type.toLowerCase()}`,
      targetType: "Wallet",
      targetId: result.wallet.id,
      newValue: {
        userId: data.userId,
        amount: data.amount,
        reason: data.reason,
        balanceBefore: result.balanceBefore,
        balanceAfter: result.balanceAfter,
        txnId: result.txn.id,
      },
      ip,
      userAgent,
    });

    // ---- 9. Notify user ----
    try {
      if (data.type === "CREDIT") {
        await notifyWalletCredited(
          data.userId,
          data.amount,
          `কারণ: ${data.reason}`
        );
      } else {
        await notifyWalletDebited(
          data.userId,
          data.amount,
          `কারণ: ${data.reason}`
        );
      }
    } catch (e) {
      console.error("Notify user failed (non-blocking):", e);
    }

    // ---- 10. Revalidate ----
    revalidatePath("/admin/wallets");
    revalidatePath("/admin/wallets/users");
    revalidatePath(`/admin/wallets/users/${data.userId}`);
    revalidatePath("/admin/wallets/transactions");
    revalidatePath("/account/wallet");

    return {
      success: true,
      message: `${data.type === "CREDIT" ? "যোগ" : "কাটা"} হয়েছে: ৳${data.amount.toFixed(2)}`,
      data: {
        balanceAfter: result.balanceAfter,
        txnId: result.txn.id,
      },
    };
  } catch (error: any) {
    const msg = error?.message || "UNKNOWN";

    if (msg === "WALLET_NOT_FOUND") {
      return { success: false, message: "User wallet পাওয়া যায়নি" };
    }
    if (msg === "WALLET_FROZEN") {
      return { success: false, message: "Wallet freeze করা আছে" };
    }
    if (msg === "USER_BANNED") {
      return { success: false, message: "User ban করা আছে" };
    }
    if (msg === "INSUFFICIENT_BALANCE") {
      return { success: false, message: "Balance পর্যাপ্ত নয়" };
    }
    if (msg === "CONCURRENT_MODIFICATION") {
      return {
        success: false,
        message: "একইসাথে অন্য কেউ update করছে — আবার চেষ্টা করুন",
      };
    }

    console.error("adjustBalanceAction error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// FREEZE / UNFREEZE WALLET
// ==================================================
export async function freezeWalletAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  let session;
  try {
    session = await requireSuperAdmin();
  } catch {
    return { success: false, message: "শুধু SUPER_ADMIN এই কাজ করতে পারবে" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = freezeWalletSchema.safeParse({
    userId: formData.get("userId"),
    action: formData.get("action"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { userId, action, reason } = parsed.data;

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) return { success: false, message: "Wallet পাওয়া যায়নি" };

    const oldStatus = wallet.status;
    const newStatus = action === "FREEZE" ? "FROZEN" : "ACTIVE";

    if (oldStatus === newStatus) {
      return {
        success: false,
        message: `Wallet আগে থেকেই ${newStatus.toLowerCase()}`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: `wallet.${action.toLowerCase()}`,
          targetType: "Wallet",
          targetId: wallet.id,
          oldValue: { status: oldStatus },
          newValue: { status: newStatus, reason },
          ipAddress: ip,
          userAgent,
        },
      });
    });

    revalidatePath("/admin/wallets");
    revalidatePath("/admin/wallets/users");
    revalidatePath(`/admin/wallets/users/${userId}`);

    return {
      success: true,
      message: action === "FREEZE" ? "Wallet freeze হয়েছে" : "Wallet unfreeze হয়েছে",
    };
  } catch (error) {
    console.error("freezeWalletAction error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// BULK CREDIT
// ==================================================
export async function bulkCreditAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  let session;
  try {
    session = await requireSuperAdmin();
  } catch {
    return { success: false, message: "শুধু SUPER_ADMIN এই কাজ করতে পারবে" };
  }

  const adminId = (session.user as any).id as string;

  // Rate limit
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const userAgent = headersList.get("user-agent") || "unknown";

  const limit = await rateLimit(
    "admin-wallet-bulk",
    adminId,
    { limit: 5, windowMs: 60 * 60 * 1000 }
  );
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfter) as AdminActionState;
  }

  // Parse
  const userIdsRaw = formData.get("userIds") as string;
  let userIds: string[] = [];
  try {
    userIds = JSON.parse(userIdsRaw || "[]");
  } catch {
    userIds = [];
  }

  const parsed = bulkCreditSchema.safeParse({
    userIds,
    amountPerUser: formData.get("amountPerUser"),
    reason: formData.get("reason"),
    note: formData.get("note"),
    confirmationCode: formData.get("confirmationCode"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  // Confirmation code
  if (data.confirmationCode.trim().toUpperCase() !== "CONFIRM") {
    return {
      success: false,
      message: 'নিশ্চিত করতে "CONFIRM" টাইপ করুন',
    };
  }

  // Cannot include self
  if (data.userIds.includes(adminId)) {
    return { success: false, message: "নিজের wallet adjust করতে পারবেন না" };
  }

  // Total check
  const totalAmount = data.amountPerUser * data.userIds.length;
  if (totalAmount > 500_000) {
    return {
      success: false,
      message: "একবারে সর্বোচ্চ ৳5,00,000 bulk credit করা যাবে",
    };
  }

  try {
    const results = await prisma.$transaction(async (tx) => {
      const success: string[] = [];
      const failed: { userId: string; reason: string }[] = [];

      for (const userId of data.userIds) {
        try {
          const wallet = await tx.wallet.findUnique({
            where: { userId },
            include: { user: { select: { status: true } } },
          });

          if (!wallet) {
            failed.push({ userId, reason: "No wallet" });
            continue;
          }
          if (wallet.status === "FROZEN") {
            failed.push({ userId, reason: "Frozen" });
            continue;
          }
          if (wallet.user.status === "BANNED") {
            failed.push({ userId, reason: "Banned" });
            continue;
          }

          const balanceBefore = Number(wallet.balance);
          const balanceAfter = balanceBefore + data.amountPerUser;

          const updated = await tx.wallet.updateMany({
            where: { id: wallet.id, balance: wallet.balance },
            data: { balance: balanceAfter },
          });

          if (updated.count === 0) {
            failed.push({ userId, reason: "Concurrent change" });
            continue;
          }

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              userId,
              type: "CREDIT",
              amount: data.amountPerUser,
              balanceBefore,
              balanceAfter,
              reason: data.reason,
              note: data.note,
              adminId,
              status: "COMPLETED",
            },
          });

          success.push(userId);
        } catch (e) {
          failed.push({ userId, reason: "Error" });
        }
      }

      return { success, failed };
    });

    // Audit log (single entry for bulk)
    await logAudit({
      actorId: adminId,
      action: "wallet.bulk_credit",
      targetType: "Wallet",
      targetId: "bulk",
      newValue: {
        amountPerUser: data.amountPerUser,
        total: totalAmount,
        reason: data.reason,
        successCount: results.success.length,
        failedCount: results.failed.length,
      },
      ip,
      userAgent,
    });

    // Notifications (non-blocking)
    for (const userId of results.success) {
      try {
        await notifyWalletCredited(
          userId,
          data.amountPerUser,
          `Bulk: ${data.reason}`
        );
      } catch {}
    }

    revalidatePath("/admin/wallets");
    revalidatePath("/admin/wallets/users");
    revalidatePath("/admin/wallets/transactions");

    return {
      success: true,
      message: `${results.success.length} জন user-কে ৳${data.amountPerUser} credit দেওয়া হয়েছে${results.failed.length > 0 ? `, ${results.failed.length} failed` : ""}`,
      data: results,
    };
  } catch (error) {
    console.error("bulkCreditAction error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// FIXED: APPROVE TOP-UP (race-safe)
// ==================================================
// ⚠️ এই version আপনার existing approveTopUpAction কে replace করবে
// (src/modules/wallet/actions.ts এ)
// ==================================================
export async function approveTopUpSafeAction(
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

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ATOMIC: only update if not already approved
      const updated = await tx.walletTopUp.updateMany({
        where: {
          id: topUpId,
          status: { notIn: ["APPROVED", "REJECTED"] },
        },
        data: {
          status: "APPROVED",
          verifiedBy: adminId,
          verifiedAt: new Date(),
          adminNote: adminNote || null,
        },
      });

      if (updated.count === 0) {
        throw new Error("ALREADY_PROCESSED");
      }

      const topUp = await tx.walletTopUp.findUnique({
        where: { id: topUpId },
      });
      if (!topUp) throw new Error("NOT_FOUND");

      // Load/init wallet
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

      if (wallet.status === "FROZEN") throw new Error("WALLET_FROZEN");

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + Number(topUp.amount);

      // Atomic balance update
      const balanceUpdate = await tx.wallet.updateMany({
        where: { id: wallet.id, balance: wallet.balance },
        data: { balance: balanceAfter },
      });

      if (balanceUpdate.count === 0) {
        throw new Error("CONCURRENT_MODIFICATION");
      }

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
          note: `Wallet top-up approved by admin`,
          adminId,
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
          newValue: {
            amount: Number(topUp.amount),
            userId: topUp.userId,
            balanceAfter,
          },
          ipAddress: ip,
          userAgent,
        },
      });

      return { topUp, balanceAfter };
    });

    revalidatePath("/admin/wallets/topups");
    revalidatePath("/admin/orders");
    revalidatePath("/account/wallet");

    try {
      const { notifyTopUpApproved } = await import("@/modules/notifications/hooks");
      await notifyTopUpApproved(
        result.topUp.userId,
        Number(result.topUp.amount),
        result.topUp.referenceNumber
      );
    } catch (e) {
      console.error("Notify failed:", e);
    }

    return {
      success: true,
      message: `৳${Number(result.topUp.amount).toFixed(2)} wallet-এ যোগ হয়েছে`,
    };
  } catch (error: any) {
    const msg = error?.message;
    if (msg === "ALREADY_PROCESSED") {
      return { success: false, message: "এই top-up আগেই process হয়েছে" };
    }
    if (msg === "NOT_FOUND") {
      return { success: false, message: "Top-up পাওয়া যায়নি" };
    }
    if (msg === "WALLET_FROZEN") {
      return { success: false, message: "User-এর wallet freeze করা আছে" };
    }
    if (msg === "CONCURRENT_MODIFICATION") {
      return { success: false, message: "একইসাথে process হচ্ছে — আবার চেষ্টা করুন" };
    }

    console.error("approveTopUpSafeAction error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}