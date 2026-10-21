import type { NextConfig } from "next";

// ==================================================
// Security Headers (OWASP Recommended)
// ==================================================
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
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
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      // ✅ connect-src-এ ইমেজ হোস্টগুলো যোগ করা হলো
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://res.cloudinary.com https://backend.gammingbazaar.com https://www.u7buy.com",
      // ✅ Vercel এর জন্য manifest-src যোগ করা হলো
      "manifest-src 'self' https://vercel.com",
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
  // ---- ⚠️ TEMPORARY: Ignore TypeScript errors ----
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
  poweredByHeader: false,

  // ---- React Strict Mode ----
  reactStrictMode: true,

  // ---- Image optimization ----
  images: {
    // ✅ সব সার্ভারে ইমেজ লোড নিশ্চিত করতে
    unoptimized: true,
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "backend.gammingbazaar.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75, 80, 85, 90, 100],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ---- Redirects ----
  async redirects() {
    return [];
  },
};

export default nextConfig;