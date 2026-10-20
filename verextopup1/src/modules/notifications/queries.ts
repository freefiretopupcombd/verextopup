import { prisma } from "@/lib/prisma";

// ==================================================
// GET USER NOTIFICATIONS (paginated)
// ==================================================
export async function getUserNotifications(
  userId: string,
  page = 1,
  perPage = 20,
  filter: "all" | "unread" = "all"
) {
  const where: any = { userId };
  if (filter === "unread") where.isRead = false;

  const skip = (page - 1) * perPage;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      icon: n.icon,
      color: n.color,
      metadata: n.metadata,
      isRead: n.isRead,
      readAt: n.readAt?.toISOString() || null,
      createdAt: n.createdAt.toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    unreadCount,
  };
}

// ==================================================
// GET UNREAD COUNT (for bell badge)
// ==================================================
export async function getUnreadCount(userId: string) {
  try {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  } catch {
    return 0;
  }
}

// ==================================================
// GET USER PREFERENCES
// ==================================================
export async function getUserPreferences(userId: string) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId },
    });
  }

  return {
    orderUpdates: prefs.orderUpdates,
    paymentUpdates: prefs.paymentUpdates,
    walletUpdates: prefs.walletUpdates,
    reviewUpdates: prefs.reviewUpdates,
    supportUpdates: prefs.supportUpdates,
    marketingEmails: prefs.marketingEmails,
    emailEnabled: prefs.emailEnabled,
  };
}

// ==================================================
// ADMIN — LIST ALL NOTIFICATIONS
// ==================================================
export async function listNotificationsAdmin({
  type = "all",
  search,
  page = 1,
  perPage = 20,
}: {
  type?: string;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const where: any = {};
  if (type && type !== "all") where.type = type;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const skip = (page - 1) * perPage;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      user: n.user,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ==================================================
// ADMIN — STATS
// ==================================================
export async function getNotificationStats() {
  const [total, unread, today] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return { total, unread, today };
}

// ==================================================
// ADMIN — TEMPLATES
// ==================================================
export async function listNotificationTemplates() {
  return await prisma.notificationTemplate.findMany({
    orderBy: { key: "asc" },
  });
}

export async function getNotificationTemplate(key: string) {
  return await prisma.notificationTemplate.findUnique({
    where: { key },
  });
}