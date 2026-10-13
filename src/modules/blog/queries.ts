import { prisma } from "@/lib/prisma";

// ==================================================
// PUBLIC — LIST PUBLISHED POSTS
// ==================================================
export async function listPublishedPosts({
  categorySlug,
  tag,
  search,
  page = 1,
  perPage = 9,
}: {
  categorySlug?: string;
  tag?: string;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const where: any = {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (tag) {
    where.tags = { has: tag };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * perPage;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
        author: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featuredImage: p.featuredImage,
      category: p.category,
      author: p.author,
      tags: p.tags,
      readTime: p.readTime,
      viewCount: p.viewCount,
      isFeatured: p.isFeatured,
      publishedAt: p.publishedAt?.toISOString() || null,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ==================================================
// PUBLIC — GET SINGLE POST BY SLUG
// ==================================================
export async function getPostBySlug(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true, color: true } },
      author: { select: { id: true, name: true, avatar: true } },
    },
  });

  if (!post) return null;
  if (post.status !== "PUBLISHED") return null;
  if (post.publishedAt && post.publishedAt > new Date()) return null;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    category: post.category,
    author: post.author,
    tags: post.tags,
    readTime: post.readTime,
    viewCount: post.viewCount,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt?.toISOString() || null,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoKeywords: post.seoKeywords,
    canonicalUrl: post.canonicalUrl,
  };
}

// ==================================================
// PUBLIC — GET RELATED POSTS
// ==================================================
export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  limit = 3
) {
  if (!categoryId) return [];

  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      categoryId,
      NOT: { id: postId },
    },
    include: {
      category: { select: { name: true, slug: true, color: true } },
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    featuredImage: p.featuredImage,
    category: p.category,
    readTime: p.readTime,
    publishedAt: p.publishedAt?.toISOString() || null,
  }));
}

// ==================================================
// PUBLIC — GET FEATURED POSTS
// ==================================================
export async function getFeaturedPosts(limit = 3) {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      isFeatured: true,
    },
    include: {
      category: { select: { name: true, slug: true, color: true } },
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    featuredImage: p.featuredImage,
    category: p.category,
    readTime: p.readTime,
    publishedAt: p.publishedAt?.toISOString() || null,
  }));
}

// ==================================================
// PUBLIC — LIST CATEGORIES
// ==================================================
export async function listBlogCategories() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          posts: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    color: c.color,
    postCount: c._count.posts,
  }));
}

// ==================================================
// PUBLIC — GET ALL TAGS
// ==================================================
export async function getAllTags() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    select: { tags: true },
  });

  const tagCount = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// ==================================================
// PUBLIC — GET POST CATEGORY
// ==================================================
export async function getBlogCategoryBySlug(slug: string) {
  return await prisma.blogCategory.findUnique({ where: { slug } });
}

// ==================================================
// ADMIN — LIST POSTS
// ==================================================
export async function listPostsAdmin({
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
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * perPage;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true, color: true } },
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featuredImage: p.featuredImage,
      status: p.status,
      category: p.category,
      author: p.author,
      viewCount: p.viewCount,
      isFeatured: p.isFeatured,
      publishedAt: p.publishedAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

// ==================================================
// ADMIN — GET POST BY ID
// ==================================================
export async function getPostByIdAdmin(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      author: { select: { name: true } },
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    categoryId: post.categoryId,
    category: post.category,
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() || null,
    scheduledFor: post.scheduledFor?.toISOString() || null,
    readTime: post.readTime,
    viewCount: post.viewCount,
    isFeatured: post.isFeatured,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoKeywords: post.seoKeywords,
    createdAt: post.createdAt.toISOString(),
  };
}

// ==================================================
// ADMIN — STATS
// ==================================================
export async function getBlogStats() {
  const [total, published, drafts, scheduled, totalViews, categoriesCount] =
    await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "DRAFT" } }),
      prisma.blogPost.count({ where: { status: "SCHEDULED" } }),
      prisma.blogPost.aggregate({ _sum: { viewCount: true } }),
      prisma.blogCategory.count(),
    ]);

  return {
    total,
    published,
    drafts,
    scheduled,
    totalViews: totalViews._sum.viewCount || 0,
    categoriesCount,
  };
}

// ==================================================
// PUBLIC — INCREMENT VIEW COUNT
// ==================================================
export async function incrementPostViews(postId: string) {
  try {
    await prisma.blogPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Silent fail
  }
}