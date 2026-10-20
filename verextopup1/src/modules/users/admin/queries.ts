import "server-only";
import { prisma } from "@/lib/prisma";

// ==================================================
// ADMIN USER QUERIES
// ==================================================

// ---- List Users ----
export async function listUsers(opts: {
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  const page = Math.max(1, opts.page || 1);
  const perPage = Math.min(100, Math.max(10, opts.perPage || 20));
  const skip = (page - 1) * perPage;

  const where: any = {};

  if (opts.search) {
    where.OR = [
      { email: { contains: opts.search, mode: "insensitive" } },
      { name: { contains: opts.search, mode: "insensitive" } },
      { phone: { contains: opts.search } },
    ];
  }

  if (opts.role && opts.role !== "all") where.role = opts.role;
  if (opts.status && opts.status !== "all") where.status = opts.status;

  let orderBy: any = { createdAt: "desc" };
  if (opts.sort === "oldest") orderBy = { createdAt: "asc" };
  if (opts.sort === "name") orderBy = { name: "asc" };
  if (opts.sort === "email") orderBy = { email: "asc" };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        role: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        wallet: {
          select: { id: true, balance: true, currency: true, status: true },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            supportTickets: true,
          },
        },
      },
      orderBy,
      take: perPage,
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      image: u.image,
      role: u.role,
      status: u.status,
      emailVerified: !!u.emailVerified,
      twoFactorEnabled: u.twoFactorEnabled,
      lastLoginAt: u.lastLoginAt?.toISOString() || null,
      createdAt: u.createdAt.toISOString(),
      wallet: u.wallet
        ? {
            id: u.wallet.id,
            balance: Number(u.wallet.balance),
            currency: u.wallet.currency,
            status: u.wallet.status,
          }
        : null,
      orderCount: u._count.orders,
      reviewCount: u._count.reviews,
      ticketCount: u._count.supportTickets,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ---- Get User Detail ----
export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      phone: true,
      image: true,
      avatar: true,
      role: true,
      status: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
      wallet: {
        select: {
          id: true,
          balance: true,
          currency: true,
          status: true,
          createdAt: true,
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 30,
          },
        },
      },
    },
  });

  if (!user) return null;

  // Stats
  const [
    orderCount,
    orderTotalAgg,
    reviewCount,
    ticketCount,
    creditAgg,
    debitAgg,
  ] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.aggregate({
      where: { userId, status: "COMPLETED" },
      _sum: { totalAmount: true },
    }),
    prisma.review.count({ where: { userId } }),
    prisma.supportTicket.count({ where: { userId } }),
    prisma.walletTransaction.aggregate({
      where: { userId, type: "CREDIT", status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.walletTransaction.aggregate({
      where: { userId, type: "DEBIT", status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      currency: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Recent reviews
  const recentReviews = await prisma.review.findMany({
    where: { userId },
    select: {
      id: true,
      rating: true,
      title: true,
      content: true,
      status: true,
      createdAt: true,
      product: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    id: user.id,
    email: user.email,
    emailVerified: !!user.emailVerified,
    name: user.name,
    phone: user.phone,
    image: user.image,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    twoFactorEnabled: user.twoFactorEnabled,
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
    lastLoginIp: user.lastLoginIp,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),

    wallet: user.wallet
      ? {
          id: user.wallet.id,
          balance: Number(user.wallet.balance),
          currency: user.wallet.currency,
          status: user.wallet.status,
          createdAt: user.wallet.createdAt.toISOString(),
          totalCredited: Number(creditAgg._sum.amount || 0),
          totalDebited: Number(debitAgg._sum.amount || 0),
          creditCount: creditAgg._count || 0,
          debitCount: debitAgg._count || 0,
          transactions: user.wallet.transactions.map((t) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            balanceBefore: Number(t.balanceBefore),
            balanceAfter: Number(t.balanceAfter),
            reason: t.reason,
            reference: t.reference,
            note: t.note,
            adminId: t.adminId,
            status: t.status,
            createdAt: t.createdAt.toISOString(),
          })),
        }
      : null,

    stats: {
      orderCount,
      orderTotal: Number(orderTotalAgg._sum.totalAmount || 0),
      reviewCount,
      ticketCount,
    },

    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: Number(o.totalAmount),
      currency: o.currency,
      createdAt: o.createdAt.toISOString(),
    })),

    recentReviews: recentReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      product: r.product,
    })),
  };
}