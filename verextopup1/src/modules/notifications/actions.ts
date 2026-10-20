"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth/session";

export type ActionState = {
  success: boolean;
  message?: string;
};

// ==================================================
// MARK AS READ (single)
// ==================================================
export async function markAsReadAction(notificationId: string) {
  let session;
  try {
    session = await requireAuth("/account/notifications");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });

    revalidatePath("/account/notifications");
    return { success: true };
  } catch {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// MARK ALL AS READ
// ==================================================
export async function markAllAsReadAction() {
  let session;
  try {
    session = await requireAuth("/account/notifications");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    revalidatePath("/account/notifications");
    return { success: true, message: "সব notification read করা হয়েছে" };
  } catch {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// DELETE NOTIFICATION
// ==================================================
export async function deleteNotificationAction(notificationId: string) {
  let session;
  try {
    session = await requireAuth("/account/notifications");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  try {
    await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });

    revalidatePath("/account/notifications");
    return { success: true, message: "Delete হয়েছে" };
  } catch {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// UPDATE PREFERENCES
// ==================================================
export async function updatePreferencesAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAuth("/account/notifications");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  const getBool = (key: string) => formData.get(key) === "on";

  try {
    await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        orderUpdates: getBool("orderUpdates"),
        paymentUpdates: getBool("paymentUpdates"),
        walletUpdates: getBool("walletUpdates"),
        reviewUpdates: getBool("reviewUpdates"),
        supportUpdates: getBool("supportUpdates"),
        marketingEmails: getBool("marketingEmails"),
        emailEnabled: getBool("emailEnabled"),
      },
      create: {
        userId,
        orderUpdates: getBool("orderUpdates"),
        paymentUpdates: getBool("paymentUpdates"),
        walletUpdates: getBool("walletUpdates"),
        reviewUpdates: getBool("reviewUpdates"),
        supportUpdates: getBool("supportUpdates"),
        marketingEmails: getBool("marketingEmails"),
        emailEnabled: getBool("emailEnabled"),
      },
    });

    revalidatePath("/account/notifications/preferences");
    return { success: true, message: "Preferences update হয়েছে" };
  } catch {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — TEMPLATE UPDATE
// ==================================================
const templateSchema = z.object({
  subject: z.string().max(200).optional().or(z.literal("")),
  body: z.string().min(1, "Body লিখুন"),
  isActive: z.boolean().default(true),
});

export async function updateTemplateAction(
  templateId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = templateSchema.safeParse({
    subject: formData.get("subject") || "",
    body: formData.get("body"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid input" };
  }

  try {
    await prisma.notificationTemplate.update({
      where: { id: templateId },
      data: {
        subject: parsed.data.subject || null,
        body: parsed.data.body,
        isActive: parsed.data.isActive,
      },
    });

    revalidatePath("/admin/notifications/templates");
    return { success: true, message: "Template update হয়েছে" };
  } catch {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}