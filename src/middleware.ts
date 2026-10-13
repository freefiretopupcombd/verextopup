import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

// ==================================================
// ROUTE CONFIGURATION
// ==================================================

// Auth pages (login, register, etc.)
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Customer protected routes
const PROTECTED_ROUTES = [
  "/account",
  "/checkout",
  "/order",   // Order details
  "/pay",     // Payment page
];

// Admin routes
const ADMIN_ROUTES = ["/admin"];

// Admin API routes (require admin auth)
const ADMIN_API_ROUTES = ["/api/admin"];

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth?.user;
  const userRole = (req.auth?.user as any)?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  // ==================================================
  // PRODUCTION: Force HTTPS
  // ==================================================
  if (
    process.env.NODE_ENV === "production" &&
    req.headers.get("x-forwarded-proto") === "http"
  ) {
    const httpsUrl = new URL(nextUrl);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 301);
  }

  // ==================================================
  // API ROUTES
  // ==================================================
  if (pathname.startsWith("/api")) {
    // ---- Admin API protection ----
    if (ADMIN_API_ROUTES.some((r) => pathname.startsWith(r))) {
      if (!isLoggedIn) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }
    return NextResponse.next();
  }

  // ==================================================
  // AUTH ROUTES (login, register, etc.)
  // ==================================================
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    // Already logged in → redirect away
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(isAdmin ? "/admin" : "/account", nextUrl)
      );
    }
    return NextResponse.next();
  }

  // ==================================================
  // ADMIN ROUTES
  // ==================================================
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(pathname)}`,
          nextUrl
        )
      );
    }
    if (!isAdmin) {
      // Logged in but not admin
      return NextResponse.redirect(new URL("/account", nextUrl));
    }
    return NextResponse.next();
  }

  // ==================================================
  // PROTECTED CUSTOMER ROUTES
  // ==================================================
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(pathname)}`,
          nextUrl
        )
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

// ==================================================
// MIDDLEWARE MATCHER
// ==================================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff|woff2|ttf|otf|map)$).*)",
  ],
};