import type { MetadataRoute } from "next";

import { getSeoSettings } from "@/modules/seo/queries";

// ==================================================
// DYNAMIC ROBOTS.TXT
// ==================================================
// Next.js generates /robots.txt from this file.
//
// Rules:
//   - Allow all public pages
//   - Disallow private pages (account, admin, api)
//   - Reference sitemap
//
// Respects admin toggle (seo.enable_indexing):
//   - true  → normal rules
//   - false → disallow all (maintenance mode)
// ==================================================

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSeoSettings();
  const baseUrl = settings.siteUrl.replace(/\/+$/, "");

  // ============================================
  // Global indexing disabled (maintenance mode)
  // ============================================
  if (!settings.enableIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  // ============================================
  // Normal rules
  // ============================================
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // ---- Auth pages ----
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",

          // ---- User account ----
          "/account",
          "/account/",
          "/checkout",
          "/cart",
          "/order/", // order detail pages (private)

          // ---- Admin ----
          "/admin",
          "/admin/",

          // ---- API ----
          "/api/",

          // ---- Search result pages ----
          // (Prevents indexing of search query URLs which could
          // create duplicate content and infinite crawl spaces)
          "/search",

          // ---- Payment redirect pages ----
          "/pay/",
        ],
      },
      // ---- Explicit rule for major bots (optional) ----
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/checkout",
          "/cart",
        ],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,

    host: baseUrl,
  };
}