import "server-only";

import { prisma } from "@/lib/prisma";

// ==================================================
// ADMIN WALLET — QUERIES
// ==================================================

// ---- Dashboard Stats ----
export async function getWalletDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalWallets,
    totalBalanceAgg,
    totalCreditedAgg,
    totalDebitedAgg,
    todayCreditedAgg,
    todayDebitedAgg,
    weekCreditedAgg,
    monthCreditedAgg,
    pendingTopUps,
    frozenWallets,
    todayTxnCount,
  ] = await Promise.all([
    prisma.wallet.count(),
    prisma.wallet.aggregate({ _sum: { balance: true } }),
    prisma.walletTransaction.aggregate({
      where: { type: "CREDIT", status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.walletTransaction.aggregate({
      where: { type: "DEBIT", status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.walletTransaction.aggregate({
      where: {
        type: "CREDIT",
        status: "COMPLETED",
        createdAt: { gte: startOfToday },
      },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: {
        type: "DEBIT",
        status: "COMPLETED",
        createdAt: { gte: startOfToday },
      },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: {
        type: "CREDIT",
        status: "COMPLETED",
        createdAt: { gte: startOfWeek },
      },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: {
        type: "CREDIT",
        status: "COMPLETED",
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.walletTopUp.count({
      where: { status: { in: ["PENDING", "AWAITING_VERIFICATION"] } },
    }),
    prisma.wallet.count({ where: { status: "FROZEN" } }),
    prisma.walletTransaction.count({
      where: { createdAt: { gte: startOfToday } },
    }),
  ]);

  return {
    totalWallets,
    totalBalance: Number(totalBalanceAgg._sum.balance || 0),
    totalCredited: Number(totalCreditedAgg._sum.amount || 0),
    totalCreditedCount: totalCreditedAgg._count || 0,
    totalDebited: Number(totalDebitedAgg._sum.amount || 0),
    totalDebitedCount: totalDebitedAgg._count || 0,
    todayCredited: Number(todayCreditedAgg._sum.amount || 0),
    todayDebited: Number(todayDebitedAgg._sum.amount || 0),
    weekCredited: Number(weekCreditedAgg._sum.amount || 0),
    monthCredited: Number(monthCreditedAgg._sum.amount || 0),
    pendingTopUps,
    frozenWallets,
    todayTxnCount,
  };
}

// ---- User List with Wallet ----
export async function listWalletUsers(opts: {
  search?: string;
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
    where.user = {
      OR: [
        { email: { contains: opts.search, mode: "insensitive" } },
        { name: { contains: opts.search, mode: "insensitive" } },
        { phone: { contains: opts.search } },
      ],
    };
  }

  if (opts.status && opts.status !== "all") {
    where.status = opts.status;
  }

  let orderBy: any = { updatedAt: "desc" };
  if (opts.sort === "balance_high") orderBy = { balance: "desc" };
  if (opts.sort === "balance_low") orderBy = { balance: "asc" };
  if (opts.sort === "newest") orderBy = { createdAt: "desc" };

  const [wallets, total] = await Promise.all([
    prisma.wallet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            image: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: { transactions: true },
        },
      },
      orderBy,
      take: perPage,
      skip,
    }),
    prisma.wallet.count({ where }),
  ]);

  return {
    wallets: wallets.map((w) => ({
      id: w.id,
      userId: w.userId,
      balance: Number(w.balance),
      currency: w.currency,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
      txnCount: w._count.transactions,
      user: w.user,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ---- Pending Top-Ups ----
export async function listPendingTopUps(opts: {
  status?: string;
  page?: number;
  perPage?: number;
}) {
  const page = Math.max(1, opts.page || 1);
  const perPage = Math.min(100, Math.max(10, opts.perPage || 20));
  const skip = (page - 1) * perPage;

  const where: any =
    opts.status && opts.status !== "all"
      ? { status: opts.status }
      : { status: { in: ["PENDING", "AWAITING_VERIFICATION"] } };

  const [topUps, total] = await Promise.all([
    prisma.walletTopUp.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
        paymentMethod: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        fields: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.walletTopUp.count({ where }),
  ]);

  return {
    topUps: topUps.map((t) => ({
      id: t.id,
      referenceNumber: t.referenceNumber,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      senderNumber: t.senderNumber,
      transactionId: t.transactionId,
      screenshotUrl: t.screenshotUrl,
      customerNote: t.customerNote,
      adminNote: t.adminNote,
      rejectionReason: t.rejectionReason,
      createdAt: t.createdAt.toISOString(),
      verifiedAt: t.verifiedAt?.toISOString() || null,
      user: t.user,
      paymentMethod: t.paymentMethod,
      fields: t.fields.map((f) => ({
        id: f.id,
        name: f.fieldName,
        label: f.fieldLabel,
        value: f.fieldValue,
        role: f.fieldRole,
      })),
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ---- All Transactions ----
export async function listAllTransactions(opts: {
  search?: string;
  type?: string;
  reason?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}) {
  const page = Math.max(1, opts.page || 1);
  const perPage = Math.min(100, Math.max(10, opts.perPage || 20));
  const skip = (page - 1) * perPage;

  const where: any = {};

  if (opts.type && opts.type !== "all") where.type = opts.type;
  if (opts.reason && opts.reason !== "all") where.reason = opts.reason;
  if (opts.userId) where.userId = opts.userId;

  if (opts.dateFrom || opts.dateTo) {
    where.createdAt = {};
    if (opts.dateFrom) where.createdAt.gte = new Date(opts.dateFrom);
    if (opts.dateTo) {
      const end = new Date(opts.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (opts.search) {
    where.OR = [
      { reference: { contains: opts.search, mode: "insensitive" } },
      { note: { contains: opts.search, mode: "insensitive" } },
      {
        user: {
          OR: [
            { email: { contains: opts.search, mode: "insensitive" } },
            { name: { contains: opts.search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const [txns, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
        wallet: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return {
    transactions: txns.map((t) => ({
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
      user: t.user,
      walletStatus: t.wallet.status,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ---- Single User Wallet Detail ----
export async function getUserWalletDetail(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          image: true,
          role: true,
          status: true,
          createdAt: true,
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!wallet) return null;

  // Aggregated stats
  const [creditAgg, debitAgg] = await Promise.all([
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

  return {
    id: wallet.id,
    userId: wallet.userId,
    balance: Number(wallet.balance),
    currency: wallet.currency,
    status: wallet.status,
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
    user: wallet.user,
    totalCredited: Number(creditAgg._sum.amount || 0),
    creditCount: creditAgg._count || 0,
    totalDebited: Number(debitAgg._sum.amount || 0),
    debitCount: debitAgg._count || 0,
    transactions: wallet.transactions.map((t) => ({
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
  };
}

// ---- Admin Daily Usage (for rate limiting display) ----
export async function getAdminDailyUsage(adminId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const agg = await prisma.walletTransaction.aggregate({
    where: {
      adminId,
      reason: { in: ["MANUAL_CREDIT", "BONUS", "COMPENSATION", "PROMOTION"] },
      createdAt: { gte: startOfToday },
    },
    _sum: { amount: true },
    _count: true,
  });

  return {
    creditedToday: Number(agg._sum.amount || 0),
    countToday: agg._count || 0,
  };
}




// ---- Export Transactions (no pagination, for CSV) ----
export async function exportTransactions(opts: {
  type?: string;
  reason?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  const where: any = {};

  if (opts.type && opts.type !== "all") where.type = opts.type;
  if (opts.reason && opts.reason !== "all") where.reason = opts.reason;
  if (opts.userId) where.userId = opts.userId;

  if (opts.dateFrom || opts.dateTo) {
    where.createdAt = {};
    if (opts.dateFrom) where.createdAt.gte = new Date(opts.dateFrom);
    if (opts.dateTo) {
      const end = new Date(opts.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (opts.search) {
    where.OR = [
      { reference: { contains: opts.search, mode: "insensitive" } },
      { note: { contains: opts.search, mode: "insensitive" } },
      {
        user: {
          OR: [
            { email: { contains: opts.search, mode: "insensitive" } },
            { name: { contains: opts.search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const txns = await prisma.walletTransaction.findMany({
    where,
    include: {
      user: {
        select: { id: true, email: true, name: true, phone: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10000, // hard limit for safety
  });

  return txns.map((t) => ({
    id: t.id,
    createdAt: t.createdAt.toISOString(),
    userName: t.user?.name || "",
    userEmail: t.user?.email || "",
    type: t.type,
    amount: Number(t.amount),
    balanceBefore: Number(t.balanceBefore),
    balanceAfter: Number(t.balanceAfter),
    reason: t.reason,
    reference: t.reference || "",
    note: t.note || "",
    adminId: t.adminId || "",
    status: t.status,
  }));
}