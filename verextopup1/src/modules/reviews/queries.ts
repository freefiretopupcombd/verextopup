import { prisma } from "@/lib/prisma";

// ==================================================
// GET PRODUCT REVIEWS (for product page)
// ==================================================
export async function getProductReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
      status: "APPROVED",
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    };
  });

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      imageUrl: r.imageUrl,
      isVerifiedPurchase: r.isVerifiedPurchase,
      isFeatured: r.isFeatured,
      helpfulCount: r.helpfulCount,
      createdAt: r.createdAt.toISOString(),
      user: {
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
      },
      replies: r.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
      })),
    })),
    totalReviews,
    averageRating,
    distribution,
  };
}

// ==================================================
// GET USER'S REVIEWS
// ==================================================
export async function getUserReviews(userId: string) {
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          icon: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    content: r.content,
    status: r.status,
    isVerifiedPurchase: r.isVerifiedPurchase,
    createdAt: r.createdAt.toISOString(),
    product: r.product,
  }));
}

// ==================================================
// GET USER'S REVIEW FOR ORDER
// ==================================================
export async function getUserReviewForOrder(
  userId: string,
  orderId: string,
  productId: string
) {
  const review = await prisma.review.findFirst({
    where: { userId, orderId, productId },
  });
  return review;
}

// ==================================================
// GET ELIGIBLE ORDERS FOR REVIEW
// Returns completed orders with items that have NOT been reviewed yet
// ==================================================
export async function getEligibleOrdersForReview(userId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnail: true,
              icon: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get all reviewed orderId+productId combos
  const reviews = await prisma.review.findMany({
    where: { userId },
    select: { orderId: true, productId: true },
  });

  const reviewedKeys = new Set(
    reviews.map((r) => `${r.orderId}:${r.productId}`)
  );

  const eligible: Array<{
    orderId: string;
    orderNumber: string;
    completedAt: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
      thumbnail: string | null;
      icon: string | null;
    };
    variantName: string | null;
  }> = [];

  for (const order of orders) {
    for (const item of order.items) {
      if (!item.product) continue;
      const key = `${order.id}:${item.product.id}`;
      if (!reviewedKeys.has(key)) {
        eligible.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          completedAt: order.completedAt?.toISOString() || null,
          product: item.product,
          variantName: item.variantName,
        });
      }
    }
  }

  return eligible;
}

// ==================================================
// ADMIN — LIST REVIEWS
// ==================================================
export async function listReviewsAdmin({
  status = "all",
  search,
  page = 1,
  perPage = 20,
}: {
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const where: any = {};

  if (status && status !== "all") where.status = status;

  if (search) {
    where.OR = [
      { content: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { product: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const skip = (page - 1) * perPage;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        product: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      status: r.status,
      isVerifiedPurchase: r.isVerifiedPurchase,
      isFeatured: r.isFeatured,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
      product: r.product,
      replyCount: r._count.replies,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    perPage,
  };
}

// ==================================================
// ADMIN — GET REVIEW BY ID
// ==================================================
export async function getReviewByIdAdmin(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          icon: true,
        },
      },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!review) return null;

  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    content: review.content,
    imageUrl: review.imageUrl,
    status: review.status,
    isVerifiedPurchase: review.isVerifiedPurchase,
    isFeatured: review.isFeatured,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt.toISOString(),
    user: review.user,
    product: review.product,
    replies: review.replies.map((r) => ({
      id: r.id,
      content: r.content,
      adminId: r.adminId,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

// ==================================================
// ADMIN — STATS
// ==================================================
export async function getReviewStats() {
  const [total, pending, approved, rejected, avgResult] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { status: "REJECTED" } }),
    prisma.review.aggregate({
      _avg: { rating: true },
      where: { status: "APPROVED" },
    }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
    averageRating: avgResult._avg.rating || 0,
  };
}