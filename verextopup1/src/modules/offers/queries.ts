import "server-only";
import { prisma } from "@/lib/prisma";

// ==================================================
// OFFERS QUERIES
// ==================================================

export type OfferProduct = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  icon: string | null;
  productType: string;
  isNew: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  soldCount: number;
  category: { name: string; slug: string } | null;
  firstVariant: {
    name: string;
    price: number;
    salePrice: number | null;
  } | null;
  variantCount: number;
  discountPercent: number;
};

// ==================================================
// HELPER: Format product
// ==================================================
function formatProduct(p: any): OfferProduct {
  const firstVariant = p.variants?.[0] || null;

  const price = firstVariant?.price
    ? Number(firstVariant.price)
    : Number(p.price);

  const salePrice = firstVariant?.salePrice
    ? Number(firstVariant.salePrice)
    : p.salePrice
      ? Number(p.salePrice)
      : null;

  const discountPercent =
    salePrice && salePrice < price
      ? Math.round(((price - salePrice) / price) * 100)
      : 0;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnail: p.thumbnail,
    icon: p.icon,
    productType: p.productType,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    isPopular: p.isPopular,
    soldCount: p.soldCount,
    category: p.category
      ? { name: p.category.name, slug: p.category.slug }
      : null,
    firstVariant: firstVariant
      ? {
          name: firstVariant.name,
          price: Number(firstVariant.price),
          salePrice: firstVariant.salePrice
            ? Number(firstVariant.salePrice)
            : null,
        }
      : null,
    variantCount: p._count?.variants || p.variants?.length || 0,
    discountPercent,
  };
}

// ==================================================
// COMMON PRODUCT SELECT
// ==================================================
const productSelect = {
  id: true,
  name: true,
  slug: true,
  thumbnail: true,
  icon: true,
  productType: true,
  isNew: true,
  isFeatured: true,
  isPopular: true,
  soldCount: true,
  price: true,
  salePrice: true,
  category: {
    select: { name: true, slug: true },
  },
  variants: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: {
      name: true,
      price: true,
      salePrice: true,
    },
  },
  _count: {
    select: { variants: true },
  },
};

// ==================================================
// GET ALL OFFERS (any product with salePrice < price)
// ==================================================
export async function getAllOffers(limit = 48): Promise<OfferProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { salePrice: { not: null } },
        {
          variants: {
            some: {
              salePrice: { not: null },
              status: "ACTIVE",
            },
          },
        },
      ],
    },
    select: productSelect,
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return products.map(formatProduct).filter((p) => p.discountPercent > 0);
}

// ==================================================
// GET FLASH SALE (30%+ discount)
// ==================================================
export async function getFlashSaleProducts(
  limit = 48
): Promise<OfferProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { salePrice: { not: null } },
        {
          variants: {
            some: {
              salePrice: { not: null },
              status: "ACTIVE",
            },
          },
        },
      ],
    },
    select: productSelect,
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    take: limit * 2, // fetch more, filter by discount
  });

  return products
    .map(formatProduct)
    .filter((p) => p.discountPercent >= 30)
    .slice(0, limit);
}

// ==================================================
// GET NEW ARRIVALS
// ==================================================
export async function getNewArrivals(limit = 48): Promise<OfferProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      isNew: true,
    },
    select: productSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return products.map(formatProduct);
}

// ==================================================
// GET FEATURED PRODUCTS
// ==================================================
export async function getFeaturedProducts(limit = 48): Promise<OfferProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      isFeatured: true,
    },
    select: productSelect,
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return products.map(formatProduct);
}

// ==================================================
// GET COUNTS (for tabs)
// ==================================================
export async function getOfferCounts() {
  const [allOffers, flashSale, newArrivals, featured] = await Promise.all([
    getAllOffers(500),
    getFlashSaleProducts(500),
    getNewArrivals(500),
    getFeaturedProducts(500),
  ]);

  return {
    all: allOffers.length,
    flashSale: flashSale.length,
    newArrivals: newArrivals.length,
    featured: featured.length,
  };
}