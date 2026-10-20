import { redirect } from "next/navigation";
import { auth } from "./auth";

// ==================================================
// Get current session (nullable)
// ==================================================
export async function getSession() {
  return await auth();
}

// ==================================================
// Get current user (nullable)
// ==================================================
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

// ==================================================
// Require authentication - redirect if not logged in
// ==================================================
export async function requireAuth(callbackUrl?: string) {
  const session = await auth();

  if (!session?.user) {
    const url = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    redirect(url);
  }

  return session;
}

// ==================================================
// Require admin role - redirect if not admin
// ==================================================
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const role = (session.user as any).role;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return session;
}

// ==================================================
// Check if user is admin (no redirect)
// ==================================================
export async function isAdmin() {
  const session = await auth();
  if (!session?.user) return false;

  const role = (session.user as any).role;
  return role === "ADMIN" || role === "SUPER_ADMIN";
}