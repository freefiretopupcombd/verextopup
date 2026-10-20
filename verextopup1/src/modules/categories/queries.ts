import "server-only";

import { prisma } from "@/lib/prisma";

// ==================================================
// HOMEPAGE CATEGORIES
// ==================================================
// Returns categories for homepage grid.
// Sorting:
//   1. Recently updated first (so admin's latest edit shows first)
//   2. Then by homepageOrder
//   3. Then by sortOrder
//   4. Then alphabetically
// ==================================================
export async function getHomepageCategories() {
  const categories = await prisma.category.findMany({
    where: {
      status: "ACTIVE",
      showOnHomepage: true,
    },
    orderBy: [
      { updatedAt: "desc" },
      { homepageOrder: "asc" },
      { sortOrder: "asc" },
      { name: "asc" },
    ],
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    image: cat.image,
    description: cat.description,
    productsCount: cat._count.products,
    homepageTag: cat.homepageTag,
  }));
}

// ==================================================
// CATEGORY WITH PRODUCTS (for popup)
// ==================================================
export async function getCategoryWithProducts(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          icon: true,
          price: true,
          salePrice: true,
          soldCount: true,
          isFeatured: true,
          isPopular: true,
          _count: {
            select: { variants: true },
          },
        },
        take: 24,
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category || category.status !== "ACTIVE") return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    image: category.image,
    description: category.description,
    productsCount: category._count.products,
    products: category.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail: p.thumbnail,
      icon: p.icon,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      soldCount: p.soldCount,
      isFeatured: p.isFeatured,
      isPopular: p.isPopular,
      variantCount: p._count.variants,
    })),
  };
}

// ==================================================
// TYPES
// ==================================================
export type HomepageCategory = Awaited<
  ReturnType<typeof getHomepageCategories>
>[number];

export type CategoryWithProducts = NonNullable<
  Awaited<ReturnType<typeof getCategoryWithProducts>>
>;