import "server-only";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// ==================================================
// HELPERS
// ==================================================
function getDateRange(from?: string, to?: string, daysBack = 30) {
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = from
    ? new Date(from)
    : new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

// ==================================================
// LIVE USERS (no cache)
// ==================================================
export async function getLiveUsers() {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const [last1min, last5min, loggedIn1min] = await Promise.all([
    prisma.activeSession.count({
      where: { lastSeenAt: { gte: oneMinuteAgo } },
    }),
    prisma.activeSession.count({
      where: { lastSeenAt: { gte: fiveMinutesAgo } },
    }),
    prisma.activeSession.count({
      where: {
        lastSeenAt: { gte: oneMinuteAgo },
        userId: { not: null },
      },
    }),
  ]);

  return {
    last1min,
    last5min,
    loggedIn: loggedIn1min,
    guests: Math.max(0, last1min - loggedIn1min),
  };
}

// ==================================================
// REVENUE ANALYTICS
// ==================================================
export const getRevenueAnalytics = unstable_cache(
  async (from?: string, to?: string) => {
    const { start, end } = getDateRange(from, to, 30);
    const previousStart = new Date(
      start.getTime() - (end.getTime() - start.getTime())
    );

    const [
      currentProductOrders,
      currentWalletTopUps,
      previousProductOrders,
      previousWalletTopUps,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { in: ["COMPLETED", "PROCESSING"] },
          paymentStatus: "PAID",
          createdAt: { gte: start, lte: end },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.walletTopUp.aggregate({
        where: {
          status: "APPROVED",
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["COMPLETED", "PROCESSING"] },
          paymentStatus: "PAID",
          createdAt: { gte: previousStart, lt: start },
        },
        _sum: { totalAmount: true },
      }),
      prisma.walletTopUp.aggregate({
        where: {
          status: "APPROVED",
          createdAt: { gte: previousStart, lt: start },
        },
        _sum: { amount: true },
      }),
    ]);

    const currentProduct = Number(currentProductOrders._sum.totalAmount || 0);
    const currentTopUp = Number(currentWalletTopUps._sum.amount || 0);
    const previousProduct = Number(previousProductOrders._sum.totalAmount || 0);
    const previousTopUp = Number(previousWalletTopUps._sum.amount || 0);

    const currentTotal = currentProduct + currentTopUp;
    const previousTotal = previousProduct + previousTopUp;
    const growthPercent =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
      current: {
        productRevenue: currentProduct,
        topUpRevenue: currentTopUp,
        totalRevenue: currentTotal,
        productOrders: currentProductOrders._count,
        topUpCount: currentWalletTopUps._count,
      },
      previous: {
        productRevenue: previousProduct,
        topUpRevenue: previousTopUp,
        totalRevenue: previousTotal,
      },
      growthPercent,
    };
  },
  ["analytics-revenue"],
  { revalidate: 300 }
);

// ==================================================
// REVENUE CHART (daily)
// ==================================================
export const getRevenueChart = unstable_cache(
  async (from?: string, to?: string) => {
    const { start, end } = getDateRange(from, to, 30);

    const ordersByDay = await prisma.$queryRaw<
      { day: Date; total: number }[]
    >`
      SELECT
        DATE_TRUNC('day', "createdAt")::date AS day,
        COALESCE(SUM("totalAmount"), 0)::float AS total
      FROM "Order"
      WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
        AND "status" IN ('COMPLETED', 'PROCESSING')
        AND "paymentStatus" = 'PAID'
      GROUP BY day
      ORDER BY day ASC
    `;

    const topUpsByDay = await prisma.$queryRaw<
      { day: Date; total: number }[]
    >`
      SELECT
        DATE_TRUNC('day', "createdAt")::date AS day,
        COALESCE(SUM("amount"), 0)::float AS total
      FROM "WalletTopUp"
      WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
        AND "status" = 'APPROVED'
      GROUP BY day
      ORDER BY day ASC
    `;

    const map = new Map<
      string,
      { date: string; product: number; topUp: number; total: number }
    >();

    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      map.set(key, { date: key, product: 0, topUp: 0, total: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const row of ordersByDay) {
      const key = new Date(row.day).toISOString().slice(0, 10);
      const entry = map.get(key);
      if (entry) {
        entry.product += Number(row.total);
        entry.total += Number(row.total);
      }
    }

    for (const row of topUpsByDay) {
      const key = new Date(row.day).toISOString().slice(0, 10);
      const entry = map.get(key);
      if (entry) {
        entry.topUp += Number(row.total);
        entry.total += Number(row.total);
      }
    }

    return Array.from(map.values());
  },
  ["analytics-revenue-chart"],
  { revalidate: 300 }
);

// ==================================================
// ORDER ANALYTICS
// ==================================================
export const getOrderAnalytics = unstable_cache(
  async (from?: string, to?: string) => {
    const { start, end } = getDateRange(from, to, 30);

    const [statusCounts, paymentStatusCounts, totalOrders] = await Promise.all([
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: start, lte: end } },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ["paymentStatus"],
        where: { createdAt: { gte: start, lte: end } },
        _count: true,
      }),
      prisma.order.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);

    return {
      total: totalOrders,
      byStatus: statusCounts.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      byPaymentStatus: paymentStatusCounts.map((s) => ({
        status: s.paymentStatus,
        count: s._count,
      })),
    };
  },
  ["analytics-orders"],
  { revalidate: 300 }
);

// ==================================================
// TOP SELLING PRODUCTS
// ==================================================
export const getTopProducts = unstable_cache(
  async (from?: string, to?: string) => {
    const { start, end } = getDateRange(from, to, 30);

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          status: { in: ["COMPLETED", "PROCESSING"] },
          paymentStatus: "PAID",
        },
        productId: { not: null },
      },
      _sum: { totalPrice: true, quantity: true },
      _count: true,
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 10,
    });

    const productIds = topProducts
      .map((p) => p.productId)
      .filter((id): id is string => id !== null);

    if (productIds.length === 0) return [];

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, icon: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return topProducts
      .map((tp) => {
        const product = tp.productId ? productMap.get(tp.productId) : null;
        return {
          productId: tp.productId,
          productName: product?.name || "Unknown",
          productIcon: product?.icon,
          productSlug: product?.slug,
          revenue: Number(tp._sum.totalPrice || 0),
          quantity: Number(tp._sum.quantity || 0),
          orderCount: tp._count,
        };
      })
      .filter((p) => p.productId);
  },
  ["analytics-top-products"],
  { revalidate: 300 }
);

// ==================================================
// USER ANALYTICS
// ==================================================
export const getUserAnalytics = unstable_cache(
  async (from?: string, to?: string) => {
    const { start, end } = getDateRange(from, to, 30);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersInRange,
      activeLastWeek,
      activeLastMonth,
      userGrowth,
      topSpenders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.user.count({
        where: { lastLoginAt: { gte: oneWeekAgo } },
      }),
      prisma.user.count({
        where: { lastLoginAt: { gte: oneMonthAgo } },
      }),
      prisma.$queryRaw<{ day: Date; count: number }[]>`
        SELECT
          DATE_TRUNC('day', "createdAt")::date AS day,
          COUNT(*)::int AS count
        FROM "User"
        WHERE "createdAt" >= ${start}
          AND "createdAt" <= ${end}
        GROUP BY day
        ORDER BY day ASC
      `,
      prisma.order.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: start, lte: end },
          status: { in: ["COMPLETED", "PROCESSING"] },
          paymentStatus: "PAID",
          userId: { not: null },
        },
        _sum: { totalAmount: true },
        _count: true,
        orderBy: { _sum: { totalAmount: "desc" } },
        take: 10,
      }),
    ]);

    const userIds = topSpenders
      .map((s) => s.userId)
      .filter((id): id is string => id !== null);

    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, image: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return {
      totalUsers,
      newUsers: newUsersInRange,
      activeLastWeek,
      activeLastMonth,
      growthChart: userGrowth.map((g) => ({
        date: new Date(g.day).toISOString().slice(0, 10),
        count: g.count,
      })),
      topSpenders: topSpenders.map((s) => {
        const user = s.userId ? userMap.get(s.userId) : null;
        return {
          userId: s.userId,
          name: user?.name || "Unknown",
          email: user?.email || "",
          image: user?.image,
          totalSpent: Number(s._sum.totalAmount || 0),
          orderCount: s._count,
        };
      }),
    };
  },
  ["analytics-users"],
  { revalidate: 300 }
);

// ==================================================
// WALLET ANALYTICS
// ==================================================
export const getWalletAnalytics = unstable_cache(
  async (from?: string, to?: string) => {
    const { start, end } = getDateRange(from, to, 30);

    const [
      totalBalanceAgg,
      creditedAgg,
      debitedAgg,
      pendingTopUps,
      reasonBreakdown,
      dailyChart,
    ] = await Promise.all([
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.walletTransaction.aggregate({
        where: {
          type: "CREDIT",
          status: "COMPLETED",
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.walletTransaction.aggregate({
        where: {
          type: "DEBIT",
          status: "COMPLETED",
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.walletTopUp.aggregate({
        where: { status: { in: ["PENDING", "AWAITING_VERIFICATION"] } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.walletTransaction.groupBy({
        by: ["reason"],
        where: {
          status: "COMPLETED",
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: "desc" } },
      }),
      prisma.$queryRaw<
        { day: Date; credits: number; debits: number }[]
      >`
        SELECT
          DATE_TRUNC('day', "createdAt")::date AS day,
          COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0)::float AS credits,
          COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0)::float AS debits
        FROM "WalletTransaction"
        WHERE "createdAt" >= ${start}
          AND "createdAt" <= ${end}
          AND status = 'COMPLETED'
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

    return {
      totalBalance: Number(totalBalanceAgg._sum.balance || 0),
      credited: {
        amount: Number(creditedAgg._sum.amount || 0),
        count: creditedAgg._count,
      },
      debited: {
        amount: Number(debitedAgg._sum.amount || 0),
        count: debitedAgg._count,
      },
      pendingTopUps: {
        amount: Number(pendingTopUps._sum.amount || 0),
        count: pendingTopUps._count,
      },
      reasonBreakdown: reasonBreakdown.map((r) => ({
        reason: r.reason,
        amount: Number(r._sum.amount || 0),
        count: r._count,
      })),
      dailyChart: dailyChart.map((d) => ({
        date: new Date(d.day).toISOString().slice(0, 10),
        credits: Number(d.credits),
        debits: Number(d.debits),
      })),
    };
  },
  ["analytics-wallet"],
  { revalidate: 300 }
);

// ==================================================
// PRODUCT ANALYTICS
// ==================================================
export const getProductAnalytics = unstable_cache(
  async () => {
    const [totalProducts, byStatus, categories, outOfStock] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.groupBy({
          by: ["status"],
          _count: true,
        }),
        prisma.category.findMany({
          select: {
            id: true,
            name: true,
            _count: { select: { products: true } },
          },
          orderBy: { name: "asc" },
        }),
        prisma.product.count({
          where: {
            unlimitedStock: false,
            stock: { lte: 0 },
          },
        }),
      ]);

    return {
      total: totalProducts,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        productCount: c._count.products,
      })),
      outOfStock,
    };
  },
  ["analytics-products"],
  { revalidate: 300 }
);

// ==================================================
// REVIEW ANALYTICS
// ==================================================
export const getReviewAnalytics = unstable_cache(
  async (from?: string, to?: string) => {
    const { start, end } = getDateRange(from, to, 30);

    const [totalReviews, byStatus, ratingDist, avgRating] =
      await Promise.all([
        prisma.review.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        prisma.review.groupBy({
          by: ["status"],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        }),
        prisma.review.groupBy({
          by: ["rating"],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        }),
        prisma.review.aggregate({
          where: { createdAt: { gte: start, lte: end }, status: "APPROVED" },
          _avg: { rating: true },
        }),
      ]);

    return {
      total: totalReviews,
      average: Number(avgRating._avg.rating || 0),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byRating: ratingDist.map((r) => ({ rating: r.rating, count: r._count })),
    };
  },
  ["analytics-reviews"],
  { revalidate: 300 }
);

// ==================================================
// SUPPORT ANALYTICS
// ==================================================
export const getSupportAnalytics = unstable_cache(
  async (from?: string, to?: string) => {
    const { start, end } = getDateRange(from, to, 30);

    const [totalTickets, byStatus, byCategory, contactMessages, openContacts] =
      await Promise.all([
        prisma.supportTicket.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        prisma.supportTicket.groupBy({
          by: ["status"],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        }),
        prisma.supportTicket.groupBy({
          by: ["category"],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        }),
        prisma.contactMessage.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        prisma.contactMessage.count({ where: { status: "NEW" } }),
      ]);

    return {
      totalTickets,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      contactMessages,
      openContacts,
    };
  },
  ["analytics-support"],
  { revalidate: 300 }
);