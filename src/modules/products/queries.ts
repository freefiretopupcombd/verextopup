import { prisma } from "@/lib/prisma";

// ==================================================
// Get product by slug with everything
// ==================================================
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      variants: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
      fields: {
        orderBy: { sortOrder: "asc" },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
          replies: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      faqs: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) return null;
  if (product.status !== "ACTIVE") return null;

  return serializeProduct(product);
}

// ==================================================
// Get related products (same category)
// ==================================================
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 8
) {
  if (!categoryId) return [];

  const products = await prisma.product.findMany({
    where: {
      categoryId,
      status: "ACTIVE",
      NOT: { id: productId },
    },
    take: limit,
    orderBy: { soldCount: "desc" },
    include: {
      variants: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  return products.map(serializeProductForCard);
}

// ==================================================
// List products with filters
// ==================================================
export async function listProducts({
  categorySlug,
  search,
  sort = "newest",
  limit = 24,
  offset = 0,
}: {
  categorySlug?: string;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  limit?: number;
  offset?: number;
}) {
  const where: any = { status: "ACTIVE" };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shortDesc: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: any =
    sort === "newest"
      ? { createdAt: "desc" }
      : sort === "popular"
        ? { soldCount: "desc" }
        : sort === "price-asc"
          ? { price: "asc" }
          : { price: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        variants: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(serializeProductForCard),
    total,
  };
}

// ==================================================
// List categories (top-level)
// ==================================================
export async function listCategories() {
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE", parentId: null },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    image: c.image,
    description: c.description,
    productsCount: c._count.products,
  }));
}

// ==================================================
// Get category by slug
// ==================================================
export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: { select: { products: true } },
    },
  });

  return category;
}

// ==================================================
// SERIALIZERS (Decimal → Number for client components)
// ==================================================
function serializeProduct(product: any) {
  // ---- Calculate rating aggregation from approved reviews ----
  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviewCount
      : null;

  return {
    // ---- Basic ----
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand,
    productType: product.productType,
    shortDesc: product.shortDesc,
    fullDesc: product.fullDesc,
    icon: product.icon,
    thumbnail: product.thumbnail,
    imageAlt: product.imageAlt, // ✅
    price: Number(product.price),
    currency: product.currency,
    status: product.status,
    deliveryType: product.deliveryType,
    instructions: product.instructions,
    badge1Text: product.badge1Text,
    badge1Icon: product.badge1Icon,
    badge1Color: product.badge1Color,
    badge2Text: product.badge2Text,
    badge2Icon: product.badge2Icon,
    badge2Color: product.badge2Color,
    badge3Text: product.badge3Text,
    badge3Icon: product.badge3Icon,
    badge3Color: product.badge3Color,
    terms: product.terms,
    soldCount: product.soldCount,
    category: product.category,

    // ==========================================
    // SEO — Core
    // ==========================================
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    canonicalUrl: product.canonicalUrl,

    // ==========================================
    // SEO — Extended (2026)
    // ==========================================
    primaryKeyword: product.primaryKeyword,
    secondaryKeywords: product.secondaryKeywords,
    ogTitle: product.ogTitle,
    ogDescription: product.ogDescription,
    ogImage: product.ogImage,
    twitterCard: product.twitterCard,
    twitterImage: product.twitterImage,
    isIndexable: product.isIndexable,
    isFollowable: product.isFollowable,
    breadcrumbLabel: product.breadcrumbLabel,

    // ---- Rating aggregate (from reviews) ----
    avgRating,
    reviewCount,

    // ---- Variants ----
    variants: (product.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: Number(v.price),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      usdtPrice: v.usdtPrice ? Number(v.usdtPrice) : null, // ✅
      stock: v.stock,
      unlimitedStock: v.unlimitedStock,
      icon: (v.customFields as any)?.icon || null,
      sortOrder: v.sortOrder,
    })),

    // ---- Fields ----
    fields: (product.fields || []).map((f: any) => ({
      id: f.id,
      label: f.label,
      name: f.name,
      fieldType: f.fieldType,
      placeholder: f.placeholder,
      helpText: f.helpText,
      required: f.required,
      minLength: f.minLength,
      maxLength: f.maxLength,
      regex: f.regex,
      defaultValue: f.defaultValue,
      options: (f.options || []).map((o: any) => ({
        label: o.label,
        value: o.value,
      })),
    })),

    // ---- Reviews ----
    reviews: reviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      imageUrl: r.imageUrl,
      isVerifiedPurchase: r.isVerifiedPurchase,
      createdAt: r.createdAt.toISOString(),
      user: {
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
      },
      replies: (r.replies || []).map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
      })),
    })),

    // ---- FAQs ----
    faqs: (product.faqs || []).map((f: any) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
    })),
  };
}

function serializeProductForCard(product: any) {
  const firstVariant = product.variants?.[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    productType: product.productType,
    icon: product.icon,
    thumbnail: product.thumbnail,
    imageAlt: product.imageAlt, // ✅
    price: Number(product.price),
    currency: product.currency,
    soldCount: product.soldCount,
    category: product.category,

     // ✅ EKHANE BADGE DATA ADD KORA HOYECHE
    badge1Text: product.badge1Text,
    badge1Icon: product.badge1Icon,
    badge1Color: product.badge1Color,
    badge2Text: product.badge2Text,
    badge2Icon: product.badge2Icon,
    badge2Color: product.badge2Color,
    badge3Text: product.badge3Text,
    badge3Icon: product.badge3Icon,
    badge3Color: product.badge3Color,


    firstVariant: firstVariant
      ? {
          name: firstVariant.name,
          price: Number(firstVariant.price),
          salePrice: firstVariant.salePrice
            ? Number(firstVariant.salePrice)
            : null,
        }
      : null,
    variantCount: product.variants?.length || 0,
  };
}

export type ProductCard = ReturnType<typeof serializeProductForCard>;
export type FullProduct = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;

// ==================================================
// Homepage queries
// ==================================================

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      isFeatured: true,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      variants: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  return products.map(serializeProductForCard);
}

export async function getSubscriptionProducts(limit = 6) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      productType: "SUBSCRIPTION",
    },
    take: limit,
    orderBy: { soldCount: "desc" },
    include: {
      variants: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    productType: p.productType,
    thumbnail: p.thumbnail,
    icon: p.icon,
    subtitle: p.shortDesc,
    categoryName: p.category?.name || null,
    price: p.variants[0] ? Number(p.variants[0].price) : Number(p.price),
    currency: p.currency,
  }));
}

// ==================================================
// Listing helpers
// ==================================================

export type ListingSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "popular";

export async function listProductsPaged({
  categorySlug,
  search,
  productType,
  sort = "newest",
  page = 1,
  perPage = 24,
}: {
  categorySlug?: string;
  search?: string;
  productType?: string;
  sort?: ListingSort;
  page?: number;
  perPage?: number;
}) {
  const where: any = { status: "ACTIVE" };

  if (categorySlug) where.category = { slug: categorySlug };
  if (productType) where.productType = productType;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shortDesc: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: any =
    sort === "newest"
      ? { createdAt: "desc" }
      : sort === "popular"
        ? { soldCount: "desc" }
        : sort === "price-asc"
          ? { price: "asc" }
          : { price: "desc" };

  const skip = (page - 1) * perPage;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: perPage,
      skip,
      include: {
        variants: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(serializeProductForCard),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    perPage,
  };
}

// ==================================================
// Get category with sub-categories
// ==================================================
export async function getCategoryWithDetails(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: { select: { products: true, children: true } },
      children: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { products: true } },
        },
      },
    },
  });

  if (!category || category.status !== "ACTIVE") return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    image: category.image,
    productsCount: category._count.products,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    children: category.children.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      productsCount: c._count.products,
    })),
  };
}