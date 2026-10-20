"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import {
  rateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { paymentMethodSchema } from "./validations";
import {
  getUddoktaPayStatus,
  setUddoktaPayEnabled,
  testUddoktaPayConnection,
  saveUddoktaPayCredentials,
  getUddoktaPayConfig,
  isUddoktaPayEnabled,
} from "./gateways/uddoktapay-config";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// HELPERS
// ==================================================
function parseFormData(formData: FormData) {
  const toBool = (v: FormDataEntryValue | null) =>
    v === "on" || v === "true";

  let inputFields: any[] = [];
  try {
    inputFields = JSON.parse(
      (formData.get("inputFields") as string) || "[]"
    );
  } catch {
    inputFields = [];
  }

  return {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    type: formData.get("type") || "MANUAL",
    logo: (formData.get("logo") as string) || "",
    accountNumber: (formData.get("accountNumber") as string) || "",
    merchantNumber: (formData.get("merchantNumber") as string) || "",
    instructions: (formData.get("instructions") as string) || "",
    requireTxnId: toBool(formData.get("requireTxnId")),
    requireScreenshot: toBool(formData.get("requireScreenshot")),
    minAmount: (formData.get("minAmount") as string) || "",
    maxAmount: (formData.get("maxAmount") as string) || "",
    status: formData.get("status") || "ACTIVE",
    sortOrder: formData.get("sortOrder") || 0,
    inputFields,
  };
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VT-${y}${m}${d}-${rand}`;
}

// ==================================================
// MANUAL PAYMENT — CREATE
// ==================================================
export async function createPaymentMethodAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = paymentMethodSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.paymentMethod.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    await prisma.paymentMethod.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        logo: data.logo || null,
        accountNumber: data.accountNumber || null,
        merchantNumber: data.merchantNumber || null,
        instructions: data.instructions || null,
        requireTxnId: data.requireTxnId,
        requireScreenshot: data.requireScreenshot,
        minAmount:
          data.minAmount !== "" && data.minAmount !== null
            ? Number(data.minAmount)
            : null,
        maxAmount:
          data.maxAmount !== "" && data.maxAmount !== null
            ? Number(data.maxAmount)
            : null,
        status: data.status,
        sortOrder: data.sortOrder,
        inputFields:
          data.inputFields.length > 0
            ? (data.inputFields as any)
            : undefined,
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/checkout");

    return { success: true, message: "Payment method তৈরি হয়েছে" };
  } catch (error) {
    console.error("Create payment error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// MANUAL PAYMENT — UPDATE
// ==================================================
export async function updatePaymentMethodAction(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = paymentMethodSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existingSlug = await prisma.paymentMethod.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (existingSlug) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    await prisma.paymentMethod.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        logo: data.logo || null,
        accountNumber: data.accountNumber || null,
        merchantNumber: data.merchantNumber || null,
        instructions: data.instructions || null,
        requireTxnId: data.requireTxnId,
        requireScreenshot: data.requireScreenshot,
        minAmount:
          data.minAmount !== "" && data.minAmount !== null
            ? Number(data.minAmount)
            : null,
        maxAmount:
          data.maxAmount !== "" && data.maxAmount !== null
            ? Number(data.maxAmount)
            : null,
        status: data.status,
        sortOrder: data.sortOrder,
        inputFields:
          data.inputFields.length > 0
            ? (data.inputFields as any)
            : undefined,
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath(`/admin/payments/${id}/edit`);
    revalidatePath("/checkout");

    return { success: true, message: "Payment method update হয়েছে" };
  } catch (error) {
    console.error("Update payment error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// MANUAL PAYMENT — DELETE
// ==================================================
export async function deletePaymentMethodAction(id: string) {
  try {
    await requireAdmin();

    const orderCount = await prisma.order.count({
      where: { paymentMethodId: id },
    });

    if (orderCount > 0) {
      await prisma.order.updateMany({
        where: { paymentMethodId: id },
        data: { paymentMethodId: null },
      });
    }

    await prisma.paymentMethod.delete({ where: { id } });

    revalidatePath("/admin/payments");
    revalidatePath("/checkout");

    return {
      success: true,
      message:
        orderCount > 0
          ? `Payment method delete হয়েছে (${orderCount} টা order-এর snapshot safe আছে)`
          : "Payment method delete হয়েছে",
    };
  } catch (error) {
    console.error("Delete payment error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// MANUAL PAYMENT — TOGGLE STATUS
// ==================================================
export async function togglePaymentStatusAction(
  id: string,
  status: string
) {
  try {
    await requireAdmin();

    await prisma.paymentMethod.update({
      where: { id },
      data: { status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/checkout");

    return { success: true, message: "Status change হয়েছে" };
  } catch (error) {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// GET ACTIVE METHODS
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
    requireTxnId: m.requireTxnId,
    requireScreenshot: m.requireScreenshot,
    inputFields: (m.inputFields as any) || [],
  }));
}

// ==================================================
// UDDOKTAPAY — TOGGLE ENABLED
// ==================================================
export async function toggleUddoktaPayAction(enabled: boolean) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  const limit = await rateLimit(
    "uddoktapay-toggle",
    ip,
    RATE_LIMITS.ADMIN_ACTION
  );
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfter);
  }

  try {
    await setUddoktaPayEnabled(enabled);

    revalidatePath("/admin/payments");
    revalidatePath("/checkout");

    return {
      success: true,
      message: `UddoktaPay ${enabled ? "চালু" : "বন্ধ"} করা হয়েছে`,
    };
  } catch (error) {
    console.error("Toggle UddoktaPay error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// UDDOKTAPAY — TEST CONNECTION
// ==================================================
export async function testUddoktaPayAction() {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const result = await testUddoktaPayConnection();
    return result;
  } catch (error) {
    console.error("Test UddoktaPay error:", error);
    return { success: false, message: "Test failed" };
  }
}

// ==================================================
// UDDOKTAPAY — GET STATUS
// ==================================================
export async function getUddoktaPayStatusAction() {
  try {
    await requireAdmin();
  } catch {
    return null;
  }

  return getUddoktaPayStatus();
}

// ==================================================
// UDDOKTAPAY — SAVE CREDENTIALS
// ==================================================
export async function saveUddoktaPayCredentialsAction(
  prevState: { success: boolean; message?: string },
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  const limit = await rateLimit(
    "uddoktapay-save",
    ip,
    RATE_LIMITS.ADMIN_ACTION
  );
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfter);
  }

  const apiUrl = (formData.get("apiUrl") as string)?.trim();
  const apiKey = (formData.get("apiKey") as string)?.trim();
  const webhookSecret = (formData.get("webhookSecret") as string)?.trim();
  const environment = (formData.get("environment") as string) || "sandbox";

  if (!apiUrl || !apiKey) {
    return {
      success: false,
      message: "API URL এবং API Key দুটোই দিতে হবে",
    };
  }

  if (environment !== "sandbox" && environment !== "production") {
    return { success: false, message: "Invalid environment" };
  }

  try {
    new URL(apiUrl);
  } catch {
    return { success: false, message: "সঠিক API URL দিন" };
  }

  try {
    await saveUddoktaPayCredentials({
      apiUrl,
      apiKey,
      webhookSecret,
      environment: environment as "sandbox" | "production",
    });

    revalidatePath("/admin/payments");

    return {
      success: true,
      message: "Credentials সফলভাবে save হয়েছে",
    };
  } catch (error) {
    console.error("Save UddoktaPay credentials error:", error);
    return { success: false, message: "Save failed" };
  }
}

// ==================================================
// UDDOKTAPAY — CHECK AVAILABILITY
// ==================================================
export async function isUddoktaPayAvailableAction() {
  try {
    return await isUddoktaPayEnabled();
  } catch {
    return false;
  }
}

// ==================================================
// UDDOKTAPAY — CREATE PAYMENT SESSION
// ==================================================
export async function createUddoktaPaySessionAction(input: {
  variantId: string;
  quantity: number;
  fields: Record<string, string>;
}): Promise<{
  success: boolean;
  paymentUrl?: string;
  orderNumber?: string;
  message?: string;
}> {
  // ---- AUTH (direct, no redirect) ----
  const session = await auth();

  console.log("[UDDOKTAPAY] Session check:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    userId: (session?.user as any)?.id,
  });

  if (!session?.user) {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  if (!userId) {
    console.error("[UDDOKTAPAY] Session has no user.id!");
    return {
      success: false,
      message: "Session invalid। আবার login করুন।",
    };
  }

  // ---- RATE LIMIT ----
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const limit = await rateLimit(
    "uddoktapay-checkout",
    `${userId}:${ip}`,
    RATE_LIMITS.CHECKOUT
  );
  if (!limit.success) {
    return {
      success: false,
      message: `অনেক বেশি চেষ্টা করেছেন। ${limit.retryAfter} সেকেন্ড পরে চেষ্টা করুন।`,
    };
  }

  // ---- CHECK ENABLED ----
  const enabled = await isUddoktaPayEnabled();
  if (!enabled) {
    return { success: false, message: "UddoktaPay এখন disable করা আছে" };
  }

  // ---- VALIDATE INPUT ----
  if (!input.variantId || !input.quantity || input.quantity < 1) {
    return { success: false, message: "Invalid input" };
  }

  try {
    // ---- FETCH VARIANT ----
    const variant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
      include: {
        product: {
          include: {
            fields: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!variant) {
      return { success: false, message: "Product পাওয়া যায়নি" };
    }
    if (
      variant.status !== "ACTIVE" ||
      variant.product.status !== "ACTIVE"
    ) {
      return { success: false, message: "Product এখন available নেই" };
    }

    // ---- VALIDATE PRODUCT FIELDS ----
    for (const field of variant.product.fields) {
      if (field.required && !input.fields[field.name]?.trim()) {
        return {
          success: false,
          message: `${field.label} দিতে হবে`,
        };
      }
    }

    // ---- SERVER-SIDE PRICE CALCULATION ----
    const unitPrice = Number(variant.price);
    const salePrice = variant.salePrice ? Number(variant.salePrice) : null;
    const finalUnitPrice = salePrice ?? unitPrice;
    const subtotal = finalUnitPrice * input.quantity;
    const discountAmount =
      salePrice && salePrice < unitPrice
        ? (unitPrice - salePrice) * input.quantity
        : 0;
    const totalAmount = subtotal;

    // ---- CREATE ORDER ----
    const orderNumber = generateOrderNumber();
    const variantIcon = (variant.customFields as any)?.icon || null;

    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING_PAYMENT",
          paymentStatus: "UNPAID",
          subtotal: unitPrice * input.quantity,
          discountAmount,
          taxAmount: 0,
          totalAmount,
          currency: variant.product.currency || "BDT",
          paymentMethodSnapshot: {
            provider: "UDDOKTAPAY",
            initiatedAt: new Date().toISOString(),
          },
          items: {
            create: [
              {
                productId: variant.productId,
                variantId: variant.id,
                productName: variant.product.name,
                variantName: variant.name,
                productSlug: variant.product.slug,
                thumbnail: variant.product.thumbnail,
                icon: variant.product.icon,
                variantIcon,
                quantity: input.quantity,
                unitPrice: finalUnitPrice,
                totalPrice: totalAmount,
                deliveryStatus: "PENDING",
                fields: {
                  create: Object.entries(input.fields)
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
                status: "PENDING_PAYMENT",
                note: "Order created - awaiting UddoktaPay payment",
                changedBy: userId,
              },
            ],
          },
        },
      });
    });

    // ---- GET UDDOKTAPAY CONFIG ----
    const config = await getUddoktaPayConfig();

    if (!config) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          internalNote: "UddoktaPay config missing",
        },
      });
      return {
        success: false,
        message: "Payment gateway configuration missing",
      };
    }

    // ---- CALL UDDOKTAPAY API ----
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const checkoutResponse = await fetch(
      `${config.apiUrl}/api/checkout-v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "RT-UDDOKTAPAY-API-KEY": config.apiKey,
        },
        body: JSON.stringify({
          full_name: session.user?.name || "Customer",
          email: session.user?.email || "customer@example.com",
          amount: totalAmount.toFixed(2),
          metadata: {
            order_id: order.id,
            order_number: order.orderNumber,
            user_id: userId,
          },
          redirect_url: `${baseUrl}/api/payment/uddoktapay/success`,
          cancel_url: `${baseUrl}/api/payment/uddoktapay/cancel`,
          webhook_url: `${baseUrl}/api/payment/uddoktapay/webhook`,
        }),
      }
    );

    const checkoutData = await checkoutResponse.json();

    console.log("[UDDOKTAPAY] Checkout response:", checkoutData);

    if (!checkoutData.status || !checkoutData.payment_url) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          internalNote: `UddoktaPay init failed: ${
            checkoutData.message || "Unknown"
          }`,
        },
      });

      return {
        success: false,
        message:
          checkoutData.message ||
          "Payment initialization failed। আবার চেষ্টা করুন।",
      };
    }

    // ---- UPDATE ORDER with UddoktaPay reference ----
// NOTE: We do NOT store invoiceId here because UddoktaPay's
// payment_url token differs from the invoice_id in callback.
// Instead, we'll match order via metadata.order_id when
// callback comes back (see success/route.ts).
await prisma.order.update({
  where: { id: order.id },
  data: {
    paymentMethodSnapshot: {
      provider: "UDDOKTAPAY",
      // Store the checkout token for debugging
      checkoutToken: checkoutData.payment_url.split("/").pop(),
      initiatedAt: new Date().toISOString(),
    },
  },
});

    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");

    return {
      success: true,
      paymentUrl: checkoutData.payment_url,
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error("[UDDOKTAPAY] Session error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}