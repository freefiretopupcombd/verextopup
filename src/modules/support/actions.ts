"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { notifyTicketReply } from "@/modules/notifications/hooks";
import { saveSupportWidgetConfig } from "./settings";
import type { SupportWidgetConfig } from "./types";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import {
  rateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";
import {
  createTicketSchema,
  replyMessageSchema,
  contactSchema,
  generateTicketNo,
} from "./validations";

export type ActionState = {
  success: boolean;
  message?: string;
  ticketId?: string;
  ticketNo?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// CREATE TICKET
// ==================================================
export async function createTicketAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAuth("/account/support");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  // ---- RATE LIMIT ----
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const userLimit = await rateLimit(
    "support-ticket-user",
    userId,
    RATE_LIMITS.SUPPORT_TICKET
  );
  if (!userLimit.success) {
    return rateLimitResponse(userLimit.retryAfter);
  }

  const ipLimit = await rateLimit(
    "support-ticket-ip",
    ip,
    RATE_LIMITS.SUPPORT_TICKET
  );
  if (!ipLimit.success) {
    return rateLimitResponse(ipLimit.retryAfter);
  }

  const parsed = createTicketSchema.safeParse({
    subject: formData.get("subject"),
    category: formData.get("category"),
    orderId: formData.get("orderId") || null,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { subject, category, orderId, message } = parsed.data;

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNo: generateTicketNo(),
        userId,
        orderId: orderId || null,
        subject,
        category,
        status: "OPEN",
        priority: "NORMAL",
        lastReplyAt: new Date(),
        messages: {
          create: {
            senderId: userId,
            senderType: "CUSTOMER",
            message,
          },
        },
      },
    });

    revalidatePath("/account/support");
    revalidatePath("/admin/support");

    return {
      success: true,
      message: "Ticket সফলভাবে তৈরি হয়েছে!",
      ticketId: ticket.id,
      ticketNo: ticket.ticketNo,
    };
  } catch (error) {
    console.error("Create ticket error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// CUSTOMER — REPLY TO TICKET
// ==================================================
export async function customerReplyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAuth("/account/support");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  const parsed = replyMessageSchema.safeParse({
    ticketId: formData.get("ticketId"),
    message: formData.get("message"),
    isInternal: false,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { ticketId, message } = parsed.data;

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.userId !== userId) {
      return { success: false, message: "Ticket পাওয়া যায়নি" };
    }

    if (ticket.status === "CLOSED") {
      return {
        success: false,
        message: "এই ticket বন্ধ করা হয়েছে",
      };
    }

    await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId,
          senderId: userId,
          senderType: "CUSTOMER",
          message,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: "OPEN",
          lastReplyAt: new Date(),
        },
      }),
    ]);

    revalidatePath(`/account/support/${ticketId}`);
    revalidatePath("/admin/support");

    return { success: true, message: "Reply পাঠানো হয়েছে" };
  } catch (error) {
    console.error("Customer reply error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — REPLY
// ==================================================
export async function adminReplyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;
  const isInternal = formData.get("isInternal") === "on";

  const parsed = replyMessageSchema.safeParse({
    ticketId: formData.get("ticketId"),
    message: formData.get("message"),
    isInternal,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { ticketId, message } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId,
          senderId: adminId,
          senderType: "ADMIN",
          message,
          isInternal,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: isInternal ? undefined : "ANSWERED",
          lastReplyAt: new Date(),
        },
      }),
    ]);

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath(`/account/support/${ticketId}`);
    revalidatePath("/account/notifications");

    if (!isInternal && ticket) {
      await notifyTicketReply(
        ticket.userId,
        ticket.id,
        ticket.ticketNo,
        ticket.subject
      );
    }

    return { success: true, message: "Reply পাঠানো হয়েছে" };
  } catch (error) {
    console.error("Admin reply error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — UPDATE STATUS
// ==================================================
export async function updateTicketStatusAction(
  ticketId: string,
  status: "OPEN" | "PENDING" | "ANSWERED" | "CLOSED"
) {
  try {
    await requireAdmin();

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        closedAt: status === "CLOSED" ? new Date() : null,
      },
    });

    revalidatePath("/admin/support");
    revalidatePath(`/admin/support/${ticketId}`);

    return { success: true, message: "Status update হয়েছে" };
  } catch (error) {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — UPDATE PRIORITY
// ==================================================
export async function updateTicketPriorityAction(
  ticketId: string,
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
) {
  try {
    await requireAdmin();

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { priority },
    });

    revalidatePath("/admin/support");
    revalidatePath(`/admin/support/${ticketId}`);

    return { success: true, message: "Priority update হয়েছে" };
  } catch (error) {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// CONTACT FORM SUBMIT
// ==================================================
export async function submitContactAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ---- RATE LIMIT (by IP, public form) ----
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const ipLimit = await rateLimit(
    "contact-ip",
    ip,
    RATE_LIMITS.CONTACT_FORM
  );
  if (!ipLimit.success) {
    return rateLimitResponse(ipLimit.retryAfter);
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: "NEW",
      },
    });

    revalidatePath("/admin/support/contacts");

    return {
      success: true,
      message: "Message পাঠানো হয়েছে! আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।",
    };
  } catch (error) {
    console.error("Contact error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — UPDATE CONTACT STATUS
// ==================================================
export async function updateContactStatusAction(
  contactId: string,
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
) {
  try {
    await requireAdmin();

    await prisma.contactMessage.update({
      where: { id: contactId },
      data: {
        status,
        repliedAt: status === "REPLIED" ? new Date() : undefined,
      },
    });

    revalidatePath("/admin/support/contacts");

    return { success: true, message: "Updated" };
  } catch (error) {
    return { success: false, message: "Failed" };
  }
}




// ==================================================
// SUBMIT GLOBAL CONTACT
// ==================================================
const globalContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export async function submitGlobalContactAction(formData: FormData) {
  // Rate limit
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const limit = await rateLimit(
    "support-contact-global",
    ip,
    RATE_LIMITS.CONTACT_FORM
  );
  if (!limit.success) {
    return {
      success: false,
      message: `অনেক বেশি request করেছেন। ${limit.retryAfter}s পরে আবার চেষ্টা করুন।`,
    };
  }

  const parsed = globalContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Input সঠিক নয়",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: "NEW",
      },
    });

    return { success: true, message: "Message পাঠানো হয়েছে" };
  } catch (error) {
    console.error("Global contact error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}




// ==================================================
// SAVE SUPPORT WIDGET CONFIG (Admin only)
// ==================================================
export async function saveSupportWidgetAction(
  prevState: { success: boolean; message?: string },
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  try {
    const config: SupportWidgetConfig = {
      enabled: formData.get("enabled") === "on",
      position: (formData.get("position") as any) || "bottom-right",
      greetingEnabled: formData.get("greetingEnabled") === "on",
      greetingMessage:
        (formData.get("greetingMessage") as string) || "",
      greetingMessageBn:
        (formData.get("greetingMessageBn") as string) || "",
      channels: {
        whatsapp: {
          enabled: formData.get("whatsapp_enabled") === "on",
          number: (formData.get("whatsapp_number") as string) || "",
          label: (formData.get("whatsapp_label") as string) || "WhatsApp",
        },
        messenger: {
          enabled: formData.get("messenger_enabled") === "on",
          username: (formData.get("messenger_username") as string) || "",
          label: (formData.get("messenger_label") as string) || "Messenger",
        },
        telegram: {
          enabled: formData.get("telegram_enabled") === "on",
          username: (formData.get("telegram_username") as string) || "",
          label: (formData.get("telegram_label") as string) || "Telegram",
        },
        phone: {
          enabled: formData.get("phone_enabled") === "on",
          number: (formData.get("phone_number") as string) || "",
          label: (formData.get("phone_label") as string) || "Call Us",
        },
        email: {
          enabled: formData.get("email_enabled") === "on",
          email: (formData.get("email_address") as string) || "",
          label: (formData.get("email_label") as string) || "Email",
        },
        ticket: {
          enabled: formData.get("ticket_enabled") === "on",
          label: (formData.get("ticket_label") as string) || "Support Ticket",
        },
      },
    };

    // Validate at least one channel enabled
    const anyEnabled = Object.values(config.channels).some(
      (c) => c.enabled
    );
    if (config.enabled && !anyEnabled) {
      return {
        success: false,
        message: "কমপক্ষে ১টা channel enable করতে হবে",
      };
    }

    await saveSupportWidgetConfig(config);

    // Audit log
    const headersList = await headers();
    const ip = getClientIp(headersList);
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorType: "ADMIN",
        action: "support.widget_updated",
        targetType: "SiteSetting",
        targetId: "support_widget_config",
        newValue: config as any,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") || "",
      },
    });

    revalidatePath("/admin/support/widget");
    revalidatePath("/", "layout"); // revalidate all pages

    return { success: true, message: "Settings সফলভাবে save হয়েছে" };
  } catch (error) {
    console.error("Save support widget error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}