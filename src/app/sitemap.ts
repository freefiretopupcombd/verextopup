import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { getSeoSettings } from "@/modules/seo/queries";
import { absoluteUrl } from "@/modules/seo/defaults";

// ==================================================
// DYNAMIC SITEMAP
// ==================================================
// Next.js App Router uses this file to generate /sitemap.xml
//
// Includes:
//   - Homepage (priority 1.0)
//   - Static pages (about, contact, faq, terms, privacy)
//   - Categories (from DB, priority 0.8)
//   - Products (from DB, priority 0.9)
//   - Blog posts (from DB, priority 0.7)
//   - Blog categories (from DB, priority 0.6)
//
// Excludes (per spec point 28):
//   - /login, /register, /forgot-password
//   - /account/*, /checkout, /cart
//   - /admin/*, /api/*
//   - Any page with isIndexable = false
//
// Regenerated on every request in dev; cached in prod.
// For very large catalogs (>50k URLs), split into
// sitemap-index + multiple sitemaps (future enhancement).
// ==================================================

const SITEMAP_REVALIDATE_SECONDS = 3600; // 1 hour

export const revalidate = SITEMAP_REVALIDATE_SECONDS;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSeoSettings();
  const baseUrl = settings.siteUrl.replace(/\/+$/, "");

  // ============================================
  // 1. Static pages (hardcoded routes that always exist)
  // ============================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ============================================
  // 2. Dynamic — Categories
  // ============================================
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE", isIndexable: true },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 5000, // safety limit
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ============================================
  // 3. Dynamic — Products
  // ============================================
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", isIndexable: true },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 40000, // safety limit under 50k
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // ============================================
  // 4. Dynamic — Blog posts (published only)
  // ============================================
  const blogPosts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      isIndexable: true,
      publishedAt: { not: null },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // ============================================
  // 5. Dynamic — Blog categories
  // ============================================
  const blogCategories = await prisma.blogCategory.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map(
    (cat: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/blog/category/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  // ============================================
  // 6. Combine all
  // ============================================
  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...blogPages,
    ...blogCategoryPages,
  ];
}