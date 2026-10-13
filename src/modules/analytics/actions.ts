"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// ==================================================
// HEARTBEAT — track active users
// ==================================================
export async function trackHeartbeat(path: string = "/") {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("visitor_session_id")?.value;

    // Generate a new session id if not present
    if (!sessionId) {
      sessionId = `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      cookieStore.set("visitor_session_id", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("cf-connecting-ip") ||
      headersList.get("x-real-ip") ||
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "";

    // Get current user (nullable)
    let userId: string | null = null;
    try {
      const session = await getSession();
      userId = (session?.user as any)?.id || null;
    } catch {
      userId = null;
    }

    // Upsert session
    await prisma.activeSession.upsert({
      where: { sessionId },
      update: {
        lastSeenAt: new Date(),
        path,
        userId,
        ipAddress,
      },
      create: {
        sessionId,
        userId,
        ipAddress,
        userAgent: userAgent.slice(0, 500),
        path,
        lastSeenAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Heartbeat error:", error);
    return { success: false };
  }
}