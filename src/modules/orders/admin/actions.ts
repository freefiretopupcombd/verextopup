"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { notifyPaymentVerified } from "@/modules/notifications/hooks";

import { requireAdmin } from "@/lib/auth/session";
import {
  updateStatusSchema,
  approvePaymentSchema,
  rejectPaymentSchema,
  refundSchema,
  internalNoteSchema,
  manualDeliverySchema,
} from "./validations";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// UPDATE ORDER STATUS
// ==================================================
export async function updateOrderStatusAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = updateStatusSchema.safeParse({
    status: formData.get("status"),
    note: formData.get("note") || "",
    notifyCustomer: formData.get("notifyCustomer") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const orderId = formData.get("orderId") as string;
  const { status, note } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) return { success: false, message: "Order পাওয়া যায়নি" };

    const oldStatus = order.status;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "COMPLETED" && !order.completedAt
          ? { completedAt: new Date() }
          : {}),
        ...(status === "CANCELLED" && !order.cancelledAt
          ? { cancelledAt: new Date() }
          : {}),
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note: note || `Status: ${oldStatus} → ${status}`,
        changedBy: adminId,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorType: "ADMIN",
        action: "order.status_update",
        targetType: "Order",
        targetId: orderId,
        oldValue: { status: oldStatus },
        newValue: { status },
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/account/orders");
    revalidatePath(`/order/${order.orderNumber}`);
    revalidatePath("/account/notifications");

    // Notify customer
    if (order.userId) {
      await notifyPaymentVerified(order.userId, order.orderNumber);
    }

    return { success: true, message: "Payment approved!" };

  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// APPROVE PAYMENT
// ==================================================
export async function approvePaymentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = approvePaymentSchema.safeParse({
    orderId: formData.get("orderId"),
    adminNote: formData.get("adminNote") || "",
    markAsPaid: formData.get("markAsPaid") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { orderId, adminNote, markAsPaid } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) return { success: false, message: "Order পাওয়া যায়নি" };

    if (order.paymentStatus === "PAID") {
      return { success: false, message: "Payment আগেই approved" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: markAsPaid ? "PAID" : order.paymentStatus,
          status: "PROCESSING",
          paidAt: markAsPaid ? new Date() : order.paidAt,
        },
      });

      await tx.paymentTransaction.updateMany({
        where: { orderId, status: "PENDING" },
        data: {
          status: "SUCCESS",
          verifiedBy: adminId,
          verifiedAt: new Date(),
        },
      });

      await tx.orderItem.updateMany({
        where: { orderId },
        data: { deliveryStatus: "PROCESSING" },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "PROCESSING",
          note: adminNote || "Payment approved by admin",
          changedBy: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: "order.payment_approved",
          targetType: "Order",
          targetId: orderId,
          oldValue: { paymentStatus: order.paymentStatus },
          newValue: { paymentStatus: "PAID", status: "PROCESSING" },
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/account/orders");
    revalidatePath(`/order/${order.orderNumber}`);

    return { success: true, message: "Payment approved!" };
  } catch (error) {
    console.error("Approve payment error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// REJECT PAYMENT
// ==================================================
export async function rejectPaymentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = rejectPaymentSchema.safeParse({
    orderId: formData.get("orderId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { orderId, reason } = parsed.data;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: "Order পাওয়া যায়নি" };

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
          status: "PENDING_PAYMENT",
          internalNote: `${order.internalNote || ""}\n[Rejected] ${reason}`.trim(),
        },
      });

      await tx.paymentTransaction.updateMany({
        where: { orderId, status: "PENDING" },
        data: {
          status: "FAILED",
          verifiedBy: adminId,
          verifiedAt: new Date(),
          rejectionReason: reason,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "PENDING_PAYMENT",
          note: `Payment rejected: ${reason}`,
          changedBy: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: "order.payment_rejected",
          targetType: "Order",
          targetId: orderId,
          oldValue: { paymentStatus: order.paymentStatus },
          newValue: { paymentStatus: "FAILED", reason },
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, message: "Payment rejected" };
  } catch (error) {
    console.error("Reject payment error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// REFUND
// ==================================================
export async function refundOrderAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = refundSchema.safeParse({
    orderId: formData.get("orderId"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
    refundToWallet: formData.get("refundToWallet") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { orderId, amount, reason, refundToWallet } = parsed.data;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: "Order পাওয়া যায়নি" };

    if (!order.userId) {
      return { success: false, message: "Guest order-এ refund wallet-এ যাবে না" };
    }

    const isPartial = amount < Number(order.totalAmount);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: isPartial ? "PARTIALLY_REFUNDED" : "REFUNDED",
          paymentStatus: "REFUNDED",
          internalNote: `${order.internalNote || ""}\n[Refund] ${reason} (৳${amount})`.trim(),
        },
      });

      if (refundToWallet && order.userId) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: order.userId },
        });

        if (wallet) {
          const newBalance = Number(wallet.balance) + amount;

          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              userId: order.userId,
              type: "CREDIT",
              amount,
              balanceBefore: Number(wallet.balance),
              balanceAfter: newBalance,
              reason: "REFUND",
              reference: order.orderNumber,
              note: reason,
              status: "COMPLETED",
            },
          });
        }
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: isPartial ? "PARTIALLY_REFUNDED" : "REFUNDED",
          note: `Refunded ৳${amount}: ${reason}`,
          changedBy: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: "order.refund",
          targetType: "Order",
          targetId: orderId,
          oldValue: { totalAmount: Number(order.totalAmount) },
          newValue: { refundAmount: amount, reason, refundToWallet },
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/account/wallet");

    return {
      success: true,
      message: isPartial ? "Partial refund হয়েছে" : "Refund হয়েছে",
    };
  } catch (error) {
    console.error("Refund error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADD INTERNAL NOTE
// ==================================================
export async function addInternalNoteAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = internalNoteSchema.safeParse({
    orderId: formData.get("orderId"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { orderId, note } = parsed.data;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: "Order পাওয়া যায়নি" };

    await prisma.order.update({
      where: { id: orderId },
      data: {
        internalNote: `${order.internalNote || ""}\n[${new Date().toLocaleString()}] ${note}`.trim(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorType: "ADMIN",
        action: "order.note_added",
        targetType: "Order",
        targetId: orderId,
        newValue: { note },
      },
    });

    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, message: "Note যোগ হয়েছে" };
  } catch (error) {
    console.error("Add note error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// MANUAL DELIVERY
// ==================================================
export async function manualDeliveryAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = manualDeliverySchema.safeParse({
    orderId: formData.get("orderId"),
    deliveryCode: formData.get("deliveryCode") || "",
    deliveryNote: formData.get("deliveryNote") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { orderId, deliveryCode, deliveryNote } = parsed.data;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: "Order পাওয়া যায়নি" };

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await tx.orderItem.updateMany({
        where: { orderId },
        data: {
          deliveryStatus: "DELIVERED",
          deliveryData: {
            deliveryCode: deliveryCode || null,
            deliveryNote: deliveryNote || null,
            deliveredAt: new Date().toISOString(),
            deliveredBy: adminId,
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "COMPLETED",
          note: `Manually delivered${deliveryCode ? `: ${deliveryCode}` : ""}`,
          changedBy: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: "order.manual_delivery",
          targetType: "Order",
          targetId: orderId,
          newValue: { deliveryCode, deliveryNote },
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/account/orders");

    return { success: true, message: "Delivery সম্পন্ন হয়েছে" };
  } catch (error) {
    console.error("Manual delivery error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// DELETE ORDER (ANY STATUS)
// ==================================================
export async function deleteOrderAction(orderId: string) {
  try {
    await requireAdmin();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) return { success: false, message: "Order পাওয়া যায়নি" };

    await prisma.$transaction(async (tx) => {
      // Delete related records
      await tx.orderItemField.deleteMany({
        where: { orderItem: { orderId } },
      });

      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.orderStatusHistory.deleteMany({ where: { orderId } });
      await tx.paymentTransaction.deleteMany({ where: { orderId } });

      await tx.order.delete({ where: { id: orderId } });
    });

    revalidatePath("/admin/orders");

    return { success: true, message: "Order delete হয়েছে" };
  } catch (error) {
    console.error("Delete order error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// BULK DELETE ORDERS
// ==================================================
export async function bulkDeleteOrdersAction(orderIds: string[]) {
  try {
    await requireAdmin();

    if (!orderIds || orderIds.length === 0) {
      return { success: false, message: "কোনো order select করা হয়নি" };
    }

    await prisma.$transaction(async (tx) => {
      // Delete related records
      await tx.orderItemField.deleteMany({
        where: { orderItem: { orderId: { in: orderIds } } },
      });

      await tx.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });

      await tx.orderStatusHistory.deleteMany({
        where: { orderId: { in: orderIds } },
      });

      await tx.paymentTransaction.deleteMany({
        where: { orderId: { in: orderIds } },
      });

      await tx.order.deleteMany({
        where: { id: { in: orderIds } },
      });
    });

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: `${orderIds.length} টা order delete হয়েছে`,
    };
  } catch (error) {
    console.error("Bulk delete error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}