import { prisma } from "@/lib/prisma";

// ==================================================
// GET WALLET DATA (existing)
// ==================================================
export async function getWalletData(userId: string) {
  const [wallet, recentTransactions, recentTopUps] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.walletTopUp.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    balance: wallet ? Number(wallet.balance) : 0,
    currency: wallet?.currency || "BDT",
    transactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      balanceBefore: Number(t.balanceBefore),
      balanceAfter: Number(t.balanceAfter),
      reason: t.reason,
      reference: t.reference,
      note: t.note,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    topUps: recentTopUps.map((t) => ({
      id: t.id,
      referenceNumber: t.referenceNumber,
      amount: Number(t.amount),
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      rejectionReason: t.rejectionReason,
    })),
  };
}

// ==================================================
// GET ALL TRANSACTIONS (paginated)
// ==================================================
export async function getWalletTransactions(
  userId: string,
  page = 1,
  perPage = 20,
  type?: "all" | "CREDIT" | "DEBIT"
) {
  const skip = (page - 1) * perPage;
  const where: any = { userId };
  if (type && type !== "all") where.type = type;

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      balanceBefore: Number(t.balanceBefore),
      balanceAfter: Number(t.balanceAfter),
      reason: t.reason,
      reference: t.reference,
      note: t.note,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ==================================================
// GET ALL TOP-UPS (paginated)
// ==================================================
export async function getWalletTopUps(
  userId: string,
  page = 1,
  perPage = 20,
  status?: string
) {
  const skip = (page - 1) * perPage;
  const where: any = { userId };
  if (status && status !== "all") where.status = status;

  const [topUps, total] = await Promise.all([
    prisma.walletTopUp.findMany({
      where,
      include: {
        paymentMethod: { select: { id: true, name: true, logo: true } },
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
      rejectionReason: t.rejectionReason,
      createdAt: t.createdAt.toISOString(),
      verifiedAt: t.verifiedAt?.toISOString() || null,
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

// ==================================================
// GET SINGLE TOP-UP
// ==================================================
export async function getTopUpById(id: string, userId: string) {
  const topUp = await prisma.walletTopUp.findUnique({
    where: { id },
    include: {
      paymentMethod: { select: { id: true, name: true, logo: true } },
      fields: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!topUp || topUp.userId !== userId) return null;

  return {
    id: topUp.id,
    referenceNumber: topUp.referenceNumber,
    amount: Number(topUp.amount),
    currency: topUp.currency,
    status: topUp.status,
    senderNumber: topUp.senderNumber,
    transactionId: topUp.transactionId,
    rejectionReason: topUp.rejectionReason,
    createdAt: topUp.createdAt.toISOString(),
    verifiedAt: topUp.verifiedAt?.toISOString() || null,
    paymentMethodSnapshot: topUp.paymentMethodSnapshot,
    paymentMethod: topUp.paymentMethod,
    fields: topUp.fields.map((f) => ({
      id: f.id,
      name: f.fieldName,
      label: f.fieldLabel,
      value: f.fieldValue,
      role: f.fieldRole,
    })),
  };
}