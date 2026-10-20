import { prisma } from "@/lib/prisma";

// ==================================================
// GET ORDER BY NUMBER (existing)
// ==================================================
export async function getOrderByNumber(orderNumber: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { fields: true } },
      paymentMethod: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return null;
  if (order.userId !== userId) return null;

  let paymentMethod = null;
  const snapshot = order.paymentMethodSnapshot as any;

  if (snapshot && typeof snapshot === "object") {
    paymentMethod = {
      id: snapshot.id || "",
      name: snapshot.name || "Unknown",
      slug: snapshot.slug || "",
      type: snapshot.type || "MANUAL",
      logo: snapshot.logo || null,
      instructions: snapshot.instructions || null,
      accountNumber: snapshot.accountNumber || null,
      merchantNumber: snapshot.merchantNumber || null,
      isSnapshot: true,
    };
  } else if (order.paymentMethod) {
    paymentMethod = {
      id: order.paymentMethod.id,
      name: order.paymentMethod.name,
      slug: order.paymentMethod.slug,
      type: order.paymentMethod.type,
      logo: order.paymentMethod.logo,
      instructions: order.paymentMethod.instructions,
      accountNumber: order.paymentMethod.accountNumber,
      merchantNumber: order.paymentMethod.merchantNumber,
      isSnapshot: false,
    };
  }

  const latestPayment = order.payments[0];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    customerNote: order.customerNote,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt?.toISOString() || null,
    paymentMethod,
    paymentSubmission: latestPayment
      ? {
          id: latestPayment.id,
          status: latestPayment.status,
          transactionId: latestPayment.transactionId,
          senderNumber: latestPayment.senderNumber,
          customerNote: latestPayment.customerNote,
          submittedAt: latestPayment.submittedAt?.toISOString() || null,
          verifiedAt: latestPayment.verifiedAt?.toISOString() || null,
          rejectionReason: latestPayment.rejectionReason,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,          // ✅ NEW
      variantId: item.variantId,          // ✅ NEW
      productName: item.productName,
      variantName: item.variantName,
      productSlug: item.productSlug,
      thumbnail: item.thumbnail,
      icon: item.icon,
      variantIcon: item.variantIcon,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      deliveryStatus: item.deliveryStatus,
      product: {
        slug: item.productSlug,
        thumbnail: item.thumbnail,
        icon: item.icon,
      },
      fields: item.fields.map((f) => ({
        fieldName: f.fieldName,
        fieldLabel: f.fieldLabel,
        fieldValue: f.fieldValue,
      })),
    })),
  };
}

export type OrderDetails = NonNullable<
  Awaited<ReturnType<typeof getOrderByNumber>>
>;

// ==================================================
// UNIFIED CUSTOMER HISTORY (Orders + Wallet Top-Ups)
// ==================================================
export type CustomerHistoryItem = {
  id: string;
  type: "PRODUCT_ORDER" | "WALLET_TOPUP";
  referenceNumber: string;
  status: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  createdAt: string;
  customer: {
    id: string | null;
    name: string | null;
    email: string;
  };
  paymentMethod: { id: string; name: string } | null;
  productInfo?: {
    productName: string;
    variantName: string | null;
    quantity: number;
    itemCount: number;
  } | null;
};

export async function listCustomerHistory({
  userId,
  type = "all",
  status = "all",
  page = 1,
  perPage = 20,
}: {
  userId: string;
  type?: "all" | "product" | "topup";
  status?: string;
  page?: number;
  perPage?: number;
}) {
  // Fetch product orders
  const productOrders =
    type === "all" || type === "product"
      ? await prisma.order.findMany({
          where: {
            userId,
            ...(status !== "all" ? { status } : {}),
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            paymentMethod: { select: { id: true, name: true } },
            items: {
              select: {
                productName: true,
                variantName: true,
                quantity: true,
              },
            },
            _count: { select: { items: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

  // Fetch wallet top-ups
  const walletTopUps =
    type === "all" || type === "topup"
      ? await prisma.walletTopUp.findMany({
          where: {
            userId,
            ...(status !== "all"
              ? {
                  status:
                    status === "COMPLETED"
                      ? "APPROVED"
                      : status === "FAILED"
                        ? "REJECTED"
                        : status === "AWAITING_VERIFICATION"
                          ? "AWAITING_VERIFICATION"
                          : status,
                }
              : {}),
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            paymentMethod: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const normalizedProducts: CustomerHistoryItem[] = productOrders.map((o) => ({
    id: o.id,
    type: "PRODUCT_ORDER",
    referenceNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    amount: Number(o.totalAmount),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    customer: o.user
      ? { id: o.user.id, name: o.user.name, email: o.user.email }
      : { id: null, name: "Guest", email: o.guestEmail || "—" },
    paymentMethod: o.paymentMethod,
    productInfo: o.items[0]
      ? {
          productName: o.items[0].productName,
          variantName: o.items[0].variantName,
          quantity: o.items[0].quantity,
          itemCount: o._count.items,
        }
      : null,
  }));

  const normalizedTopUps: CustomerHistoryItem[] = walletTopUps.map((t) => {
    const mappedPaymentStatus =
      t.status === "APPROVED"
        ? "PAID"
        : t.status === "REJECTED"
          ? "FAILED"
          : t.status === "AWAITING_VERIFICATION"
            ? "PENDING"
            : "UNPAID";

    const mappedOrderStatus =
      t.status === "APPROVED"
        ? "COMPLETED"
        : t.status === "REJECTED"
          ? "FAILED"
          : t.status === "AWAITING_VERIFICATION"
            ? "AWAITING_VERIFICATION"
            : "PENDING_PAYMENT";

    return {
      id: t.id,
      type: "WALLET_TOPUP",
      referenceNumber: t.referenceNumber,
      status: mappedOrderStatus,
      paymentStatus: mappedPaymentStatus,
      amount: Number(t.amount),
      currency: t.currency,
      createdAt: t.createdAt.toISOString(),
      customer: t.user
        ? { id: t.user.id, name: t.user.name, email: t.user.email }
        : { id: null, name: "Unknown", email: "—" },
      paymentMethod: t.paymentMethod,
      productInfo: null,
    };
  });

  const allItems = [...normalizedProducts, ...normalizedTopUps].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const total = allItems.length;
  const skip = (page - 1) * perPage;
  const paginated = allItems.slice(skip, skip + perPage);

  return {
    items: paginated,
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    perPage,
  };
}

// ==================================================
// CUSTOMER STATS
// ==================================================
export async function getCustomerStats(userId: string) {
  const [
    totalOrders,
    completedOrders,
    pendingOrders,
    totalTopUps,
    approvedTopUps,
  ] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.order.count({
      where: {
        userId,
        status: { in: ["PENDING_PAYMENT", "AWAITING_VERIFICATION"] },
      },
    }),
    prisma.walletTopUp.count({ where: { userId } }),
    prisma.walletTopUp.count({
      where: { userId, status: "APPROVED" },
    }),
  ]);

  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    totalTopUps,
    approvedTopUps,
    totalHistory: totalOrders + totalTopUps,
  };
}