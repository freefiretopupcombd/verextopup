import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// ==================================================
// AUTH CONFIGURATION
// ==================================================
// Security decisions:
//   - JWT session with short maxAge
//   - allowDangerousEmailAccountLinking: false (CRITICAL)
//   - Role fetched from token (verified during login)
// ==================================================

export const authConfig = {
  // ---- Custom pages ----
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ---- Session strategy ----
  session: {
    strategy: "jwt",
    // Shorter maxAge = less window for session hijacking
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,  // Refresh token daily
  },

  // ---- Cookie security ----
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // ---- Trust host (needed for production behind proxy) ----
  trustHost: true,

  // ---- Providers ----
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // ⚠️ CRITICAL: MUST be false to prevent OAuth account takeover
      // When true, an attacker who creates a Google account with a
      // victim's email could hijack their account.
      allowDangerousEmailAccountLinking: false,
    }),
  ],

  // ---- Callbacks ----
  callbacks: {
    // ---- Authorization check (middleware uses this) ----
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Admin routes
      if (pathname.startsWith("/admin")) {
        const role = (auth?.user as any)?.role;
        return (
          !!auth?.user && (role === "ADMIN" || role === "SUPER_ADMIN")
        );
      }

      // Account, checkout, order, pay
      if (
        pathname.startsWith("/account") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/order") ||
        pathname.startsWith("/pay")
      ) {
        return !!auth?.user;
      }

      return true;
    },

    // ---- JWT callback ----
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
        token.email = user.email;
      }
      return token;
    },

    // ---- Session callback ----
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;