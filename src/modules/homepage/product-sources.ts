import "server-only";

import { prisma } from "@/lib/prisma";

import type { SectionProduct, SourceType } from "./types";

// ==================================================
// FETCH PRODUCTS BY SOURCE
// ==================================================
// Centralizes all logic for fetching products
// based on source type.
// ==================================================
export async function fetchProductsBySource(
  sectionId: string,
  sourceType: SourceType,
  sourceData: any,
  limit: number
): Promise<SectionProduct[]> {
  switch (sourceType) {
    case "CATEGORY":
      return fetchFromCategory(sourceData?.categoryId, limit);

    case "FEATURED":
      return fetchFeatured(limit);

    case "ON_SALE":
      return fetchOnSale(limit);

    case "POPULAR":
      return fetchPopular(limit);

    case "NEW_ARRIVALS":
      return fetchNewArrivals(limit);

    case "SUBSCRIPTIONS":
      return fetchSubscriptions(limit);

    case "MANUAL":
      return fetchManual(sectionId, limit);

    default:
      return [];
  }
}

// ==================================================
// SERIALIZER
// ==================================================
function serializeProduct(p: any): SectionProduct {
  console.log("Product Data check:", p.name, "Badge:", p.badge1Text);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnail: p.thumbnail,
    icon: p.icon,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    currency: p.currency,
    soldCount: p.soldCount,
    isFeatured: p.isFeatured,
    isPopular: p.isPopular,
    isNew: p.isNew,
    categoryName: p.category?.name || null,
    categorySlug: p.category?.slug || null,
    
    // 👇 EKHANE BADGE DATA ADD KORA HOYECHE
    badge1Text: p.badge1Text,
    badge1Icon: p.badge1Icon,
    badge1Color: p.badge1Color,
    badge2Text: p.badge2Text,
    badge2Icon: p.badge2Icon,
    badge2Color: p.badge2Color,
    badge3Text: p.badge3Text,
    badge3Icon: p.badge3Icon,
    badge3Color: p.badge3Color,
  };
}

const SELECT_BASE = {
  id: true,
  name: true,
  slug: true,
  thumbnail: true,
  icon: true,
  price: true,
  salePrice: true,
  currency: true,
  soldCount: true,
  isFeatured: true,
  isPopular: true,
  isNew: true,
  category: { select: { name: true, slug: true } },
  
  // 👇 EKHANE BADGE FIELD GULO ADD KORA HOYECHE
  badge1Text: true,
  badge1Icon: true,
  badge1Color: true,
  badge2Text: true,
  badge2Icon: true,
  badge2Color: true,
  badge3Text: true,
  badge3Icon: true,
  badge3Color: true,
} as const;

// ==================================================
// CATEGORY
// ==================================================
async function fetchFromCategory(categoryId: string | undefined, limit: number) {
  if (!categoryId) return [];

  const products = await prisma.product.findMany({
    where: {
      categoryId,
      status: "ACTIVE",
    },
    take: limit,
    orderBy: [{ isPopular: "desc" }, { soldCount: "desc" }],
    select: SELECT_BASE,
  });

  return products.map(serializeProduct);
}

// ==================================================
// FEATURED
// ==================================================
async function fetchFeatured(limit: number) {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, status: "ACTIVE" },
    take: limit,
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    select: SELECT_BASE,
  });
  return products.map(serializeProduct);
}

// ==================================================
// ON SALE
// ==================================================
async function fetchOnSale(limit: number) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      salePrice: { not: null },
    },
    take: limit,
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    select: SELECT_BASE,
  });
  return products.map(serializeProduct);
}

// ==================================================
// POPULAR (best selling)
// ==================================================
async function fetchPopular(limit: number) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", isPopular: true },
    take: limit,
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    select: SELECT_BASE,
  });
  return products.map(serializeProduct);
}

// ==================================================
// NEW ARRIVALS
// ==================================================
async function fetchNewArrivals(limit: number) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: SELECT_BASE,
  });
  return products.map(serializeProduct);
}

// ==================================================
// SUBSCRIPTIONS
// ==================================================
async function fetchSubscriptions(limit: number) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", productType: "SUBSCRIPTION" },
    take: limit,
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    select: SELECT_BASE,
  });
  return products.map(serializeProduct);
}

// ==================================================
// MANUAL
// ==================================================
async function fetchManual(sectionId: string, limit: number) {
  const mappings = await prisma.homepageSectionProduct.findMany({
    where: { sectionId },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });

  if (mappings.length === 0) return [];

  const productIds = mappings.map((m) => m.productId);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      status: "ACTIVE",
    },
    select: SELECT_BASE,
  });

  // Preserve order from mappings
  const map = new Map(products.map((p) => [p.id, p]));
  const ordered = productIds
    .map((id) => map.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return ordered.map(serializeProduct);
}