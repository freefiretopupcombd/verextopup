"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/rate-limit";
import { notifyUser } from "@/modules/notifications/service";
import {
  changeRoleSchema,
  changeStatusSchema,
  sendNotificationSchema,
  bulkStatusSchema,
} from "./validations";

export type AdminActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// INTERNAL: Auth helpers
// ==================================================
async function requireSuperAdminOrThrow() {
  const session = await getSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  const role = (session.user as any).role;
  if (role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
  return session;
}

async function requireAdminOrThrow() {
  const session = await getSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

async function logAudit(opts: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: any;
  newValue?: any;
  ip?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: opts.actorId,
      actorType: "ADMIN",
      action: opts.action,
      targetType: opts.targetType,
      targetId: opts.targetId,
      oldValue: opts.oldValue ?? undefined,
      newValue: opts.newValue ?? undefined,
      ipAddress: opts.ip,
      userAgent: opts.userAgent,
    },
  });
}

// ==================================================
// CHANGE ROLE — SUPER_ADMIN only
// ==================================================
// Rules:
//   ✅ Self-promote ADMIN → SUPER_ADMIN (with confirmation)
//   ❌ Self-demote SUPER_ADMIN → ADMIN/CUSTOMER (lockout prevention)
//   ✅ Promote other user → SUPER_ADMIN (with confirmation)
//   ✅ Demote other SUPER_ADMIN (only if not the last one)
//   ❌ Demote the last SUPER_ADMIN (system lockout prevention)
// ==================================================
export async function changeRoleAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  let session;
  try {
    session = await requireSuperAdminOrThrow();
  } catch {
    return {
      success: false,
      message: "শুধু SUPER_ADMIN এই কাজ করতে পারবে",
    };
  }

  const adminId = (session.user as any).id as string;

  const parsed = changeRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { userId, role, reason } = parsed.data;
  const isSelf = userId === adminId;

  // ==================================================
  // SELF-PROMOTION RULES
  // ==================================================
  if (isSelf) {
    const currentRole = (session.user as any).role;

    // ❌ Block self-demotion from SUPER_ADMIN
    if (currentRole === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      return {
        success: false,
        message:
          "নিজের SUPER_ADMIN role থেকে demote করা যাবে না। অন্য SUPER_ADMIN কে দিয়ে করান।",
      };
    }

    // ✅ Self-promotion to SUPER_ADMIN — requires double confirmation
    if (role === "SUPER_ADMIN") {
      const confirmSuperAdmin = formData.get("confirmSuperAdmin");
      if (confirmSuperAdmin !== "yes") {
        return {
          success: false,
          message:
            "SUPER_ADMIN বানানোর জন্য নিশ্চিতকরণ প্রয়োজন। Checkbox tick করুন।",
        };
      }
    }
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      return { success: false, message: "User পাওয়া যায়নি" };
    }
    if (user.role === role) {
      return {
        success: false,
        message: `User already ${role} role এ আছে`,
      };
    }

    // ==================================================
    // PROTECT: Last SUPER_ADMIN (for any user)
    // ==================================================
    if (user.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN" },
      });

      if (superAdminCount <= 1) {
        return {
          success: false,
          message:
            "শেষ SUPER_ADMIN কে demote করা যাবে না। আগে অন্য কাউকে SUPER_ADMIN বানান।",
        };
      }
    }

    // ==================================================
    // CONFIRM: Promotion to SUPER_ADMIN (for other users)
    // ==================================================
    if (role === "SUPER_ADMIN" && !isSelf) {
      const confirmSuperAdmin = formData.get("confirmSuperAdmin");
      if (confirmSuperAdmin !== "yes") {
        return {
          success: false,
          message:
            "SUPER_ADMIN বানানোর জন্য নিশ্চিতকরণ প্রয়োজন। Checkbox tick করুন।",
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: "user.role_changed",
          targetType: "User",
          targetId: userId,
          oldValue: { role: user.role },
          newValue: { role, reason },
          ipAddress: ip,
          userAgent,
        },
      });
    });

    // Notify user (non-blocking)
    try {
      await notifyUser(
        userId,
        "ACCOUNT_UPDATED",
        "🔐 Account Role Updated",
        `আপনার account role পরিবর্তন করা হয়েছে: ${user.role} → ${role}`,
        "/account",
        { role }
      );
    } catch (e) {
      console.error("Notification failed:", e);
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: `Role পরিবর্তন হয়েছে: ${user.role} → ${role}`,
    };
  } catch (error) {
    console.error("changeRoleAction error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// CHANGE STATUS (Ban/Unban) — SUPER_ADMIN only
// ==================================================
export async function changeStatusAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  let session;
  try {
    session = await requireSuperAdminOrThrow();
  } catch {
    return { success: false, message: "শুধু SUPER_ADMIN এই কাজ করতে পারবে" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = changeStatusSchema.safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { userId, status, reason } = parsed.data;

  if (userId === adminId) {
    return { success: false, message: "নিজের account ban করতে পারবেন না" };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true, role: true },
    });

    if (!user) return { success: false, message: "User পাওয়া যায়নি" };
    if (user.status === status) {
      return { success: false, message: `User already ${status}` };
    }
    if (user.role === "SUPER_ADMIN") {
      return {
        success: false,
        message: "SUPER_ADMIN কে ban করা যাবে না",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: `user.status_changed`,
          targetType: "User",
          targetId: userId,
          oldValue: { status: user.status },
          newValue: { status, reason },
          ipAddress: ip,
          userAgent,
        },
      });
    });

    // Notify
    try {
      const isBan = status === "BANNED";
      await notifyUser(
        userId,
        isBan ? "ACCOUNT_BANNED" : "ACCOUNT_UPDATED",
        isBan ? "🚫 Account Suspended" : "✅ Account Status Updated",
        isBan
          ? `আপনার account suspend করা হয়েছে। কারণ: ${reason}`
          : `আপনার account status পরিবর্তন হয়েছে: ${status}`,
        "/account",
        { status, reason }
      );
    } catch (e) {
      console.error("Notification failed:", e);
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: `Status পরিবর্তন: ${user.status} → ${status}`,
    };
  } catch (error) {
    console.error("changeStatusAction error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// SEND NOTIFICATION — any Admin
// ==================================================
export async function sendNotificationAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  let session;
  try {
    session = await requireAdminOrThrow();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = sendNotificationSchema.safeParse({
    userId: formData.get("userId"),
    title: formData.get("title"),
    message: formData.get("message"),
    link: formData.get("link") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { userId, title, message, link } = parsed.data;

  try {
    await notifyUser(
      userId,
      "ADMIN_MESSAGE",
      title,
      message,
      link || "/account",
      { fromAdmin: true }
    );

    return { success: true, message: "Notification পাঠানো হয়েছে" };
  } catch (error) {
    console.error("sendNotificationAction error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// BULK STATUS CHANGE
// ==================================================
export async function bulkStatusAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  let session;
  try {
    session = await requireSuperAdminOrThrow();
  } catch {
    return { success: false, message: "শুধু SUPER_ADMIN এই কাজ করতে পারবে" };
  }

  const adminId = (session.user as any).id as string;

  let userIds: string[] = [];
  try {
    userIds = JSON.parse((formData.get("userIds") as string) || "[]");
  } catch {
    userIds = [];
  }

  const parsed = bulkStatusSchema.safeParse({
    userIds,
    status: formData.get("status"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { userIds: ids, status, reason } = parsed.data;

  // Cannot include self
  if (ids.includes(adminId)) {
    return { success: false, message: "নিজের account পরিবর্তন করা যাবে না" };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Only change CUSTOMER/ADMIN users — skip SUPER_ADMIN
      const targets = await tx.user.findMany({
        where: {
          id: { in: ids },
          role: { not: "SUPER_ADMIN" },
        },
        select: { id: true, status: true },
      });

      const updated = await tx.user.updateMany({
        where: { id: { in: targets.map((t) => t.id) } },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorType: "ADMIN",
          action: "user.bulk_status_changed",
          targetType: "User",
          targetId: "bulk",
          newValue: {
            status,
            reason,
            count: updated.count,
            skipped: ids.length - targets.length,
          },
          ipAddress: ip,
          userAgent,
        },
      });

      return { updated: updated.count, skipped: ids.length - targets.length };
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${result.updated} জন user এর status "${status}" করা হয়েছে${
        result.skipped > 0 ? ` (${result.skipped} skipped)` : ""
      }`,
    };
  } catch (error) {
    console.error("bulkStatusAction error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}