"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { notifyOrderPlaced } from "@/modules/notifications/hooks";
import {
  rateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";

export type CreateOrderState = {
  success: boolean;
  message?: string;
  orderNumber?: string;
  errors?: Record<string, string[]>;
};

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VT-${y}${m}${d}-${rand}`;
}

const createOrderSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(100),
  paymentType: z.enum(["wallet", "instant"]),
  paymentMethodId: z.string().optional().nullable(),
  fields: z.record(z.string(), z.string()),
  paymentFields: z.record(z.string(), z.string()).optional(),
});

// ==================================================
// CREATE ORDER — Wallet + Instant (with inline payment submit)
// ==================================================
export async function createOrderFromProductAction(
  formData: FormData
): Promise<CreateOrderState> {
  // ---- AUTH ----
  let session;
  try {
    session = await requireAuth("/");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  // ---- RATE LIMIT (per user, per IP) ----
  // Checkout abuse prevention:
  //   - Per user: 10 orders/minute (prevents rapid fake orders)
  //   - Per IP: 10 orders/minute (prevents multi-account abuse)
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const userLimit = await rateLimit(
    "order-create-user",
    userId,
    RATE_LIMITS.CHECKOUT
  );
  if (!userLimit.success) {
    return rateLimitResponse(userLimit.retryAfter);
  }

  const ipLimit = await rateLimit(
    "order-create-ip",
    ip,
    RATE_LIMITS.CHECKOUT
  );
  if (!ipLimit.success) {
    return rateLimitResponse(ipLimit.retryAfter);
  }

  // ---- PARSE FIELDS ----
  const fieldsRaw = formData.get("fields") as string;
  let fields: Record<string, string> = {};
  try {
    fields = JSON.parse(fieldsRaw || "{}");
  } catch {
    return { success: false, message: "Invalid fields" };
  }

  const paymentFieldsRaw = formData.get("paymentFields") as string;
  let paymentFields: Record<string, string> = {};
  try {
    paymentFields = JSON.parse(paymentFieldsRaw || "{}");
  } catch {
    paymentFields = {};
  }

  const parsed = createOrderSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity") || 1,
    paymentType: formData.get("paymentType"),
    paymentMethodId: formData.get("paymentMethodId") || null,
    fields,
    paymentFields,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { variantId, quantity, paymentType, paymentMethodId } = parsed.data;

  try {
    // ---- FETCH VARIANT (server-side authoritative data) ----
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            fields: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!variant) {
      return { success: false, message: "Product পাওয়া যায়নি" };
    }
    if (variant.status !== "ACTIVE" || variant.product.status !== "ACTIVE") {
      return { success: false, message: "Product এখন available নেই" };
    }

    if (
      !variant.unlimitedStock &&
      variant.stock !== null &&
      variant.stock < quantity
    ) {
      return {
        success: false,
        message: `মাত্র ${variant.stock} টা available`,
      };
    }

    // Validate product fields
    for (const field of variant.product.fields) {
      if (field.required && !fields[field.name]?.trim()) {
        return {
          success: false,
          message: `${field.label} দিতে হবে`,
        };
      }
    }

    // ⚠️ SERVER-SIDE PRICE CALCULATION — never trust client
    const unitPrice = Number(variant.price);
    const salePrice = variant.salePrice ? Number(variant.salePrice) : null;
    const finalUnitPrice = salePrice ?? unitPrice;
    const subtotal = finalUnitPrice * quantity;
    const discountAmount =
      salePrice && salePrice < unitPrice
        ? (unitPrice - salePrice) * quantity
        : 0;
    const totalAmount = subtotal;

    const variantIcon = (variant.customFields as any)?.icon || null;

    const orderItemSnapshot = {
      productId: variant.productId,
      variantId: variant.id,
      productName: variant.product.name,
      variantName: variant.name,
      productSlug: variant.product.slug,
      thumbnail: variant.product.thumbnail,
      icon: variant.product.icon,
      variantIcon,
      quantity,
      unitPrice: finalUnitPrice,
      totalPrice: totalAmount,
      deliveryStatus: "PENDING" as const,
    };

    // ==================================================
    // WALLET PAYMENT — Auto-paid
    // ==================================================
    if (paymentType === "wallet") {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        return { success: false, message: "Wallet পাওয়া যায়নি" };
      }

      const walletBalance = Number(wallet.balance);

      if (walletBalance < totalAmount) {
        return {
          success: false,
          message: `Wallet-এ যথেষ্ট balance নেই। প্রয়োজন: ৳${totalAmount.toFixed(2)}, আছে: ৳${walletBalance.toFixed(2)}`,
        };
      }

      const order = await prisma.$transaction(async (tx) => {
        const freshWallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!freshWallet) throw new Error("Wallet not found");

        const freshBalance = Number(freshWallet.balance);
        if (freshBalance < totalAmount) {
          throw new Error("Insufficient balance");
        }

        const newBalance = freshBalance - totalAmount;

        await tx.wallet.update({
          where: { userId },
          data: { balance: newBalance },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: freshWallet.id,
            userId,
            type: "DEBIT",
            amount: totalAmount,
            balanceBefore: freshBalance,
            balanceAfter: newBalance,
            reason: "ORDER_PAYMENT",
            note: `Order payment for ${variant.product.name}`,
            status: "COMPLETED",
          },
        });

        const newOrder = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId,
            status: "PROCESSING",
            paymentStatus: "PAID",
            subtotal: unitPrice * quantity,
            discountAmount,
            taxAmount: 0,
            totalAmount,
            currency: variant.product.currency || "BDT",
            paidAt: new Date(),
            items: {
              create: [
                {
                  ...orderItemSnapshot,
                  fields: {
                    create: Object.entries(fields)
                      .filter(([_, v]) => v)
                      .map(([name, value]) => {
                        const fieldDef = variant.product.fields.find(
                          (f) => f.name === name
                        );
                        return {
                          fieldName: name,
                          fieldLabel: fieldDef?.label || name,
                          fieldValue: value,
                        };
                      }),
                  },
                },
              ],
            },
            statusHistory: {
              create: [
                {
                  status: "PROCESSING",
                  note: "Order created via wallet payment",
                  changedBy: userId,
                },
              ],
            },
          },
        });

        if (!variant.unlimitedStock && variant.stock !== null) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: quantity } },
          });
        }

        await tx.product.update({
          where: { id: variant.productId },
          data: { soldCount: { increment: quantity } },
        });

        return newOrder;
      });

      revalidatePath("/account/orders");
      revalidatePath("/account/wallet");
      revalidatePath("/admin/orders");
      revalidatePath("/account/notifications");

      await notifyOrderPlaced(userId, order.orderNumber);

      return {
        success: true,
        message: "Order তৈরি হয়েছে!",
        orderNumber: order.orderNumber,
      };
    }

    // ==================================================
    // INSTANT PAYMENT — Order + Payment submission
    // ==================================================
    if (!paymentMethodId) {
      return { success: false, message: "Payment method select করুন" };
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod || paymentMethod.status !== "ACTIVE") {
      return { success: false, message: "Payment method invalid" };
    }

    // Validate payment fields
    const methodFields: any[] = Array.isArray(paymentMethod.inputFields)
      ? (paymentMethod.inputFields as any[])
      : [];

    for (const field of methodFields) {
      if (field.required && !paymentFields[field.name]?.trim()) {
        return {
          success: false,
          message: `${field.label} দিতে হবে`,
        };
      }
    }

    const paymentMethodSnapshot = {
      id: paymentMethod.id,
      name: paymentMethod.name,
      slug: paymentMethod.slug,
      type: paymentMethod.type,
      logo: paymentMethod.logo,
      accountNumber: paymentMethod.accountNumber,
      merchantNumber: paymentMethod.merchantNumber,
      instructions: paymentMethod.instructions,
      inputFields: methodFields,
      snapshottedAt: new Date().toISOString(),
    };

    const txnId =
      paymentFields.transaction_id ||
      paymentFields.txn_id ||
      paymentFields.transactionId ||
      null;

    const senderNumber =
      paymentFields.sender_number ||
      paymentFields.mobile_number ||
      paymentFields.sender ||
      null;

    // ---- Duplicate txn check (server-side) ----
    if (txnId) {
      const existingTxn = await prisma.paymentTransaction.findFirst({
        where: { transactionId: txnId },
      });
      if (existingTxn) {
        return {
          success: false,
          message: "এই Transaction ID আগেই ব্যবহার হয়েছে",
        };
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          status: "AWAITING_VERIFICATION",
          paymentStatus: "PENDING",
          subtotal: unitPrice * quantity,
          discountAmount,
          taxAmount: 0,
          totalAmount,
          currency: variant.product.currency || "BDT",
          paymentMethodId: paymentMethod.id,
          paymentMethodSnapshot,
          items: {
            create: [
              {
                ...orderItemSnapshot,
                fields: {
                  create: Object.entries(fields)
                    .filter(([_, v]) => v)
                    .map(([name, value]) => {
                      const fieldDef = variant.product.fields.find(
                        (f) => f.name === name
                      );
                      return {
                        fieldName: name,
                        fieldLabel: fieldDef?.label || name,
                        fieldValue: value,
                      };
                    }),
                },
              },
            ],
          },
          statusHistory: {
            create: [
              {
                status: "AWAITING_VERIFICATION",
                note: "Order placed with payment submission",
                changedBy: userId,
              },
            ],
          },
        },
      });

      await tx.paymentTransaction.create({
        data: {
          orderId: newOrder.id,
          paymentMethodId: paymentMethod.id,
          amount: totalAmount,
          currency: variant.product.currency || "BDT",
          status: "PENDING",
          transactionId: txnId,
          senderNumber,
          customerNote: null,
          submittedAt: new Date(),
          gatewayResponse: { fields: paymentFields },
        },
      });

      if (!variant.unlimitedStock && variant.stock !== null) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: quantity } },
        });
      }

      await tx.product.update({
        where: { id: variant.productId },
        data: { soldCount: { increment: quantity } },
      });

      return newOrder;
    });

    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/account/notifications");

    await notifyOrderPlaced(userId, order.orderNumber);

    return {
      success: true,
      message: "Order সফলভাবে তৈরি হয়েছে!",
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error("Create order error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
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