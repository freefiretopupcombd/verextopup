import { prisma } from "@/lib/prisma";

// ==================================================
// GET USER TICKETS
// ==================================================
export async function getUserTickets(userId: string) {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    include: {
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { lastReplyAt: "desc" },
  });

  return tickets.map((t) => ({
    id: t.id,
    ticketNo: t.ticketNo,
    subject: t.subject,
    category: t.category,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt.toISOString(),
    lastReplyAt: t.lastReplyAt?.toISOString() || t.createdAt.toISOString(),
    messageCount: t._count.messages,
    lastMessage: t.messages[0]
      ? {
          senderType: t.messages[0].senderType,
          message: t.messages[0].message,
          createdAt: t.messages[0].createdAt.toISOString(),
        }
      : null,
  }));
}

// ==================================================
// GET TICKET DETAIL (customer — own only)
// ==================================================
export async function getUserTicketDetail(ticketId: string, userId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket || ticket.userId !== userId) return null;

  return {
    id: ticket.id,
    ticketNo: ticket.ticketNo,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    orderId: ticket.orderId,
    createdAt: ticket.createdAt.toISOString(),
    messages: ticket.messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      message: m.message,
      attachment: m.attachment,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

// ==================================================
// GET USER'S COMPLETED ORDERS (for ticket linking)
// ==================================================
export async function getUserRecentOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ["COMPLETED", "PROCESSING", "AWAITING_VERIFICATION"] },
    },
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    totalAmount: Number(o.totalAmount),
    status: o.status,
  }));
}

// ==================================================
// ADMIN — LIST TICKETS
// ==================================================
export async function listTicketsAdmin({
  status = "all",
  category = "all",
  priority = "all",
  search,
  page = 1,
  perPage = 20,
}: {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const where: any = {};

  if (status && status !== "all") where.status = status;
  if (category && category !== "all") where.category = category;
  if (priority && priority !== "all") where.priority = priority;

  if (search) {
    where.OR = [
      { ticketNo: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const skip = (page - 1) * perPage;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true } },
      },
      orderBy: [{ lastReplyAt: "desc" }, { createdAt: "desc" }],
      take: perPage,
      skip,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      subject: t.subject,
      category: t.category,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt.toISOString(),
      lastReplyAt: t.lastReplyAt?.toISOString() || t.createdAt.toISOString(),
      messageCount: t._count.messages,
      user: t.user,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ==================================================
// ADMIN — GET TICKET DETAIL
// ==================================================
export async function getTicketDetailAdmin(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) return null;

  return {
    id: ticket.id,
    ticketNo: ticket.ticketNo,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    orderId: ticket.orderId,
    createdAt: ticket.createdAt.toISOString(),
    user: ticket.user,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderType: m.senderType,
      message: m.message,
      isInternal: m.isInternal,
      attachment: m.attachment,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

// ==================================================
// ADMIN — SUPPORT STATS
// ==================================================
export async function getSupportStats() {
  const [total, open, pending, answered, closed, contactsNew] =
    await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "PENDING" } }),
      prisma.supportTicket.count({ where: { status: "ANSWERED" } }),
      prisma.supportTicket.count({ where: { status: "CLOSED" } }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
    ]);

  return { total, open, pending, answered, closed, contactsNew };
}

// ==================================================
// ADMIN — LIST CONTACTS
// ==================================================
export async function listContactsAdmin({
  status = "all",
  page = 1,
  perPage = 20,
}: {
  status?: string;
  page?: number;
  perPage?: number;
}) {
  const where: any = {};
  if (status && status !== "all") where.status = status;

  const skip = (page - 1) * perPage;

  const [contacts, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return {
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      message: c.message,
      status: c.status,
      adminNote: c.adminNote,
      repliedAt: c.repliedAt?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}