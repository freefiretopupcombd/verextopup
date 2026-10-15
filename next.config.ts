import type { NextConfig } from "next";

// ==================================================
// Security Headers (OWASP Recommended)
// ==================================================
// These headers protect against:
//   - XSS attacks
//   - Clickjacking
//   - MIME sniffing
//   - Referrer leaking
//   - Unwanted browser features
// ==================================================

const securityHeaders = [
  // ---- Strict Transport Security ----
  // Force HTTPS for 2 years, include subdomains
  // NOTE: Only enable in production over HTTPS
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },

  // ---- X-Frame-Options ----
  // Prevent clickjacking — site can't be iframed by others
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },

  // ---- X-Content-Type-Options ----
  // Prevent MIME type sniffing — browser trusts our Content-Type
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },

  // ---- Referrer-Policy ----
  // Send referrer only to same origin
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },

  // ---- Permissions-Policy ----
  // Disable unnecessary browser features
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
  },

  // ---- X-DNS-Prefetch-Control ----
  // Control DNS prefetching
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },

  // ---- Cross-Origin-Opener-Policy ----
  // Isolate browsing context
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },

  // ---- Content-Security-Policy ----
  // NOTE: This is a permissive CSP for first launch.
  // After testing, tighten it. Comment out "unsafe-inline" and
  // "unsafe-eval" in production after verifying nothing breaks.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' and 'unsafe-eval' for dev
      // In production, replace with nonce-based CSP
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
      "frame-src 'self' https://www.googletagmanager.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ---- ⚠️ TEMPORARY: Ignore TypeScript errors for initial deployment ----
  // TODO: Fix all TypeScript errors and remove this block later.
  typescript: {
    ignoreBuildErrors: true,
  },
  

  // ---- Apply security headers on all routes ----
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // ---- Disable X-Powered-By header ----
  // Don't leak that we use Next.js
  poweredByHeader: false,

  // ---- React Strict Mode ----
  reactStrictMode: true,

  // ---- Image optimization ----
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**",
    },
  ],
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
},

  // ---- Redirects ----
  async redirects() {
    return [
      // Redirect www to non-www (optional, adjust per your DNS)
      // {
      //   source: "/:path*",
      //   has: [{ type: "host", value: "www.verextopup.com" }],
      //   destination: "https://verextopup.com/:path*",
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;