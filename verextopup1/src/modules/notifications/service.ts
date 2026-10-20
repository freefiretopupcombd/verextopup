import { prisma } from "@/lib/prisma";
import { NOTIFICATION_TYPES, type NotificationType } from "./types";

// ==================================================
// CREATE NOTIFICATION
// ==================================================
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}) {
  try {
    const typeConfig = NOTIFICATION_TYPES[type];

    // 👇 Safety check — unknown type হলে silently fail না করে log করবে
    if (!typeConfig) {
      console.error(
        `[Notification] Unknown type: "${type}". Add it to NOTIFICATION_TYPES in types.ts`
      );
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
        icon: typeConfig.icon,
        color: typeConfig.color,
        metadata: metadata || undefined,
      },
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
}

// ==================================================
// CHECK USER PREFERENCE
// ==================================================
export async function isNotificationEnabled(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  try {
    const typeConfig = NOTIFICATION_TYPES[type];
    if (!typeConfig) return true; // unknown type → don't block

    const category = typeConfig.category;

    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // If no preference record, default = true
    if (!prefs) return true;

    // Check specific category
    return (prefs as any)[category] !== false;
  } catch {
    return true;
  }
}

// ==================================================
// NOTIFY USER (with preference check)
// ==================================================
export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  metadata?: any
) {
  const enabled = await isNotificationEnabled(userId, type);
  if (!enabled) return null;

  return createNotification({
    userId,
    type,
    title,
    message,
    link,
    metadata,
  });
}