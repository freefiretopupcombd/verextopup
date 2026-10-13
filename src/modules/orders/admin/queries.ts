import { prisma } from "@/lib/prisma";

// ==================================================
// UNIFIED ORDERS + TOP-UPS LIST
// ==================================================
export type UnifiedOrder = {
  id: string;
  type: "PRODUCT_ORDER" | "WALLET_TOPUP";
  referenceNumber: string;
  status: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  customer: {
    id: string | null;
    name: string | null;
    email: string;
  };
  paymentMethod: { id: string; name: string } | null;
  // For product orders
  productInfo?: {
    productName: string;
    variantName: string | null;
    quantity: number;
    itemCount: number;
  } | null;
};

export async function listUnifiedOrders({
  status,
  paymentStatus,
  paymentMethodId,
  dateFrom,
  dateTo,
  search,
  type,
  sort = "newest",
  page = 1,
  perPage = 20,
}: {
  status?: string;
  paymentStatus?: string;
  paymentMethodId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  type?: "all" | "product" | "topup";
  sort?: "newest" | "oldest" | "amount-high" | "amount-low";
  page?: number;
  perPage?: number;
}) {
  const activeType = type || "all";

  // Build common date filter
  const dateFilter: any = {};
  if (dateFrom || dateTo) {
    dateFilter.createdAt = {};
    if (dateFrom) dateFilter.createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      dateFilter.createdAt.lte = to;
    }
  }

  // ============================================
  // Fetch product orders
  // ============================================
  let productOrders: any[] = [];
  if (activeType === "all" || activeType === "product") {
    const where: any = { ...dateFilter };

    if (status && status !== "all") where.status = status;
    if (paymentStatus && paymentStatus !== "all")
      where.paymentStatus = paymentStatus;
    if (paymentMethodId) where.paymentMethodId = paymentMethodId;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { guestEmail: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    productOrders = await prisma.order.findMany({
      where,
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
    });
  }

  // ============================================
  // Fetch wallet top-ups
  // ============================================
  let walletTopUps: any[] = [];
  if (activeType === "all" || activeType === "topup") {
    const where: any = { ...dateFilter };

    if (status && status !== "all") {
      // Map unified status to top-up status
      const statusMap: Record<string, string> = {
        PENDING_PAYMENT: "AWAITING_VERIFICATION",
        AWAITING_VERIFICATION: "AWAITING_VERIFICATION",
        COMPLETED: "APPROVED",
        PAID: "APPROVED",
        FAILED: "REJECTED",
        CANCELLED: "CANCELLED",
        REFUNDED: "REJECTED",
      };
      where.status = statusMap[status] || status;
    }

    if (paymentMethodId) where.paymentMethodId = paymentMethodId;

    if (search) {
      where.OR = [
        { referenceNumber: { contains: search, mode: "insensitive" } },
        { transactionId: { contains: search, mode: "insensitive" } },
        { senderNumber: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    walletTopUps = await prisma.walletTopUp.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        paymentMethod: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ============================================
  // Normalize both to unified format
  // ============================================
  const normalizedProducts: UnifiedOrder[] = productOrders.map((o) => ({
    id: o.id,
    type: "PRODUCT_ORDER",
    referenceNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    amount: Number(o.totalAmount),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt?.toISOString() || null,
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

  const normalizedTopUps: UnifiedOrder[] = walletTopUps.map((t) => {
    // Map top-up status to unified status display
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
      paidAt: t.verifiedAt?.toISOString() || null,
      customer: t.user
        ? { id: t.user.id, name: t.user.name, email: t.user.email }
        : { id: null, name: "Unknown", email: "—" },
      paymentMethod: t.paymentMethod,
      productInfo: null,
    };
  });

  // ============================================
  // Merge + Sort
  // ============================================
  const allOrders = [...normalizedProducts, ...normalizedTopUps];

  // Sort
  allOrders.sort((a, b) => {
    if (sort === "newest") {
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sort === "oldest") {
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    if (sort === "amount-high") {
      return b.amount - a.amount;
    }
    if (sort === "amount-low") {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Paginate
  const total = allOrders.length;
  const skip = (page - 1) * perPage;
  const paginatedOrders = allOrders.slice(skip, skip + perPage);

  return {
    orders: paginatedOrders,
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    perPage,
  };
}

// ==================================================
// UNIFIED STATS
// ==================================================
export async function getUnifiedStats() {
  const [
    productOrdersCount,
    topUpsCount,
    pendingProductOrders,
    pendingTopUps,
    completedProductOrders,
    approvedTopUps,
    productRevenue,
    topUpRevenue,
    todayProductRevenue,
    todayTopUpRevenue,
    monthProductRevenue,
    monthTopUpRevenue,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.walletTopUp.count(),
    prisma.order.count({
      where: {
        status: { in: ["PENDING_PAYMENT", "AWAITING_VERIFICATION"] },
      },
    }),
    prisma.walletTopUp.count({
      where: { status: "AWAITING_VERIFICATION" },
    }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.walletTopUp.count({ where: { status: "APPROVED" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.walletTopUp.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        paymentStatus: "PAID",
        paidAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.walletTopUp.aggregate({
      _sum: { amount: true },
      where: {
        status: "APPROVED",
        verifiedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        paymentStatus: "PAID",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.walletTopUp.aggregate({
      _sum: { amount: true },
      where: {
        status: "APPROVED",
        verifiedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    totalOrders: productOrdersCount + topUpsCount,
    totalProductOrders: productOrdersCount,
    totalTopUps: topUpsCount,
    pendingOrders: pendingProductOrders + pendingTopUps,
    pendingProductOrders,
    pendingTopUps,
    completedOrders: completedProductOrders + approvedTopUps,
    completedProductOrders,
    approvedTopUps,
    totalRevenue:
      Number(productRevenue._sum.totalAmount || 0) +
      Number(topUpRevenue._sum.amount || 0),
    todayRevenue:
      Number(todayProductRevenue._sum.totalAmount || 0) +
      Number(todayTopUpRevenue._sum.amount || 0),
    monthRevenue:
      Number(monthProductRevenue._sum.totalAmount || 0) +
      Number(monthTopUpRevenue._sum.amount || 0),
    productRevenue: Number(productRevenue._sum.totalAmount || 0),
    topUpRevenue: Number(topUpRevenue._sum.amount || 0),
  };
}

// ==================================================
// PROFIT STATS (only product orders)
// ==================================================
export async function getProfitStats() {
  const paidOrderItems = await prisma.orderItem.findMany({
    where: { order: { paymentStatus: "PAID" } },
    include: {
      variant: { select: { costPrice: true } },
    },
  });

  let totalProfit = 0;
  let totalCost = 0;

  for (const item of paidOrderItems) {
    const salePrice = Number(item.unitPrice) * item.quantity;
    const costPrice = item.variant?.costPrice
      ? Number(item.variant.costPrice) * item.quantity
      : 0;
    totalProfit += salePrice - costPrice;
    totalCost += costPrice;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayItems = await prisma.orderItem.findMany({
    where: {
      order: { paymentStatus: "PAID", paidAt: { gte: todayStart } },
    },
    include: { variant: { select: { costPrice: true } } },
  });

  let todayProfit = 0;
  for (const item of todayItems) {
    const salePrice = Number(item.unitPrice) * item.quantity;
    const costPrice = item.variant?.costPrice
      ? Number(item.variant.costPrice) * item.quantity
      : 0;
    todayProfit += salePrice - costPrice;
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthItems = await prisma.orderItem.findMany({
    where: {
      order: { paymentStatus: "PAID", paidAt: { gte: monthStart } },
    },
    include: { variant: { select: { costPrice: true } } },
  });

  let monthProfit = 0;
  for (const item of monthItems) {
    const salePrice = Number(item.unitPrice) * item.quantity;
    const costPrice = item.variant?.costPrice
      ? Number(item.variant.costPrice) * item.quantity
      : 0;
    monthProfit += salePrice - costPrice;
  }

  return {
    totalProfit,
    totalCost,
    todayProfit,
    monthProfit,
  };
}

// ==================================================
// GET ORDER BY ID (admin view)
// ==================================================
export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      paymentMethod: true,
      coupon: true,
      items: {
  include: {
    product: {
      select: {
        thumbnail: true,
        icon: true,
      },
    },
    variant: {
      select: {
        customFields: true,
      },
    },
    fields: true,
  },
},
      statusHistory: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return null;

  const snapshot = order.paymentMethodSnapshot as any;
  const paymentMethod = order.paymentMethod
    ? {
        id: order.paymentMethod.id,
        name: order.paymentMethod.name,
        slug: order.paymentMethod.slug,
        type: order.paymentMethod.type,
        logo: order.paymentMethod.logo,
        accountNumber: order.paymentMethod.accountNumber,
        merchantNumber: order.paymentMethod.merchantNumber,
        instructions: order.paymentMethod.instructions,
        isSnapshot: false,
      }
    : snapshot && typeof snapshot === "object"
      ? {
          id: snapshot.id || "",
          name: snapshot.name || "Deleted Method",
          slug: snapshot.slug || "",
          type: snapshot.type || "MANUAL",
          logo: snapshot.logo || null,
          accountNumber: snapshot.accountNumber || null,
          merchantNumber: snapshot.merchantNumber || null,
          instructions: snapshot.instructions || null,
          isSnapshot: true,
        }
      : null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    taxAmount: Number(order.taxAmount),
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    customerNote: order.customerNote,
    internalNote: order.internalNote,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paidAt: order.paidAt?.toISOString() || null,
    completedAt: order.completedAt?.toISOString() || null,
    cancelledAt: order.cancelledAt?.toISOString() || null,
    ipAddress: order.ipAddress,
    userAgent: order.userAgent,
    customer: order.user
      ? {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone,
          isGuest: false,
        }
      : {
          id: null,
          name: "Guest",
          email: order.guestEmail || "—",
          phone: null,
          isGuest: true,
        },
    paymentMethod,
    coupon: order.coupon
      ? { code: order.coupon.code, discountType: order.coupon.discountType }
      : null,
    items: order.items.map((item) => ({
  id: item.id,
  productId: item.productId,
  variantId: item.variantId,
  productName: item.productName,
  variantName: item.variantName,
  productSlug: item.productSlug,
  thumbnail: item.thumbnail,
  icon: item.icon,
  variantIcon: item.variantIcon,
  product: item.product,   // ✅ এই লাইনটা যোগ করুন
  variant: item.variant,   // ✅ এটাও যোগ করুন (variant relation include করেছি)
  quantity: item.quantity,
  unitPrice: Number(item.unitPrice),
  totalPrice: Number(item.totalPrice),
  deliveryStatus: item.deliveryStatus,
  deliveryData: item.deliveryData,
  fields: item.fields.map((f) => ({
    fieldName: f.fieldName,
    fieldLabel: f.fieldLabel,
    fieldValue: f.fieldValue,
  })),
})),
    statusHistory: order.statusHistory.map((h) => ({
      id: h.id,
      status: h.status,
      note: h.note,
      changedBy: h.changedBy,
      createdAt: h.createdAt.toISOString(),
    })),
    payments: order.payments.map((p: any) => {
      const fields: Record<string, string> = p.gatewayResponse?.fields || {};
      return {
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        transactionId: p.transactionId || null,
        senderNumber: p.senderNumber || null,
        customerNote: p.customerNote || null,
        submittedAt: p.submittedAt?.toISOString() || null,
        screenshotUrl: p.screenshotUrl || null,
        verifiedBy: p.verifiedBy || null,
        verifiedAt: p.verifiedAt?.toISOString() || null,
        rejectionReason: p.rejectionReason || null,
        createdAt: p.createdAt.toISOString(),
        fields,
      };
    }),
  };
}

export type AdminOrder = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;