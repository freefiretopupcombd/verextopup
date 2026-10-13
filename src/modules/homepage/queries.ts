import "server-only";

import { prisma } from "@/lib/prisma";

import { fetchProductsBySource } from "./product-sources";
import type {
  HomepageSection,
  LayoutType,
  RenderedSection,
  SourceType,
} from "./types";

// ==================================================
// ADMIN — GET ALL SECTIONS
// ==================================================
export async function getAllHomepageSections() {
  return prisma.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

// ==================================================
// ADMIN — GET SINGLE SECTION
// ==================================================
export async function getHomepageSectionById(id: string) {
  return prisma.homepageSection.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

// ==================================================
// ADMIN — GET MANUAL PRODUCTS FOR SECTION
// ==================================================
export async function getSectionManualProducts(sectionId: string) {
  const mappings = await prisma.homepageSectionProduct.findMany({
    where: { sectionId },
    orderBy: { sortOrder: "asc" },
  });

  if (mappings.length === 0) return [];

  const productIds = mappings.map((m) => m.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      icon: true,
      price: true,
      salePrice: true,
      currency: true,
      status: true,
    },
  });

  const map = new Map(products.map((p) => [p.id, p]));

  return productIds
    .map((id) => map.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail: p.thumbnail,
      icon: p.icon,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      currency: p.currency,
      status: p.status,
    }));
}

// ==================================================
// FRONTEND — GET ALL ACTIVE SECTIONS WITH PRODUCTS
// ==================================================
export async function getRenderedHomepageSections(): Promise<
  RenderedSection[]
> {
  const sections = await prisma.homepageSection.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const rendered: RenderedSection[] = await Promise.all(
    sections.map(async (section) => {
      const products = await fetchProductsBySource(
        section.id,
        section.sourceType as SourceType,
        section.sourceData,
        section.itemLimit
      );

      return {
        id: section.id,
        title: section.title,
        subtitle: section.subtitle,
        layoutType: section.layoutType as LayoutType,
        sourceType: section.sourceType as SourceType,
        sourceData: section.sourceData as any,
        itemLimit: section.itemLimit,
        mobileColumns: section.mobileColumns ?? 2,
        desktopColumns: section.desktopColumns ?? 4,
        viewAllUrl: section.viewAllUrl,
        viewAllText: section.viewAllText,
        products,
      };
    })
  );

  return rendered.filter((s) => s.products.length > 0);
}