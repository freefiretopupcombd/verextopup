"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import {
  blogPostSchema,
  blogCategorySchema,
  calculateReadTime,
} from "./validations";

export type ActionState = {
  success: boolean;
  message?: string;
  postId?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// CREATE BLOG POST
// ==================================================
export async function createBlogPostAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  const tagsRaw = formData.get("tags") as string;

  const parsed = blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || "",
    content: formData.get("content"),
    featuredImage: formData.get("featuredImage") || "",
    categoryId: formData.get("categoryId") || "",
    tags: tagsRaw || "",
    status: formData.get("status") || "DRAFT",
    publishedAt: formData.get("publishedAt") || "",
    scheduledFor: formData.get("scheduledFor") || "",
    readTime: formData.get("readTime") || 5,
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: formData.get("seoTitle") || "",
    seoDescription: formData.get("seoDescription") || "",
    seoKeywords: formData.get("seoKeywords") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    const tags = data.tags
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const readTime = calculateReadTime(data.content);

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        featuredImage: data.featuredImage || null,
        authorId: adminId,
        categoryId: data.categoryId || null,
        tags,
        status: data.status,
        publishedAt:
          data.status === "PUBLISHED"
            ? data.publishedAt
              ? new Date(data.publishedAt)
              : new Date()
            : data.publishedAt
              ? new Date(data.publishedAt)
              : null,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        readTime,
        isFeatured: data.isFeatured,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return {
      success: true,
      message: "Blog post তৈরি হয়েছে",
      postId: post.id,
    };
  } catch (error) {
    console.error("Create blog post error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// UPDATE BLOG POST
// ==================================================
export async function updateBlogPostAction(
  postId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const tagsRaw = formData.get("tags") as string;

  const parsed = blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || "",
    content: formData.get("content"),
    featuredImage: formData.get("featuredImage") || "",
    categoryId: formData.get("categoryId") || "",
    tags: tagsRaw || "",
    status: formData.get("status") || "DRAFT",
    publishedAt: formData.get("publishedAt") || "",
    scheduledFor: formData.get("scheduledFor") || "",
    readTime: formData.get("readTime") || 5,
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: formData.get("seoTitle") || "",
    seoDescription: formData.get("seoDescription") || "",
    seoKeywords: formData.get("seoKeywords") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existingSlug = await prisma.blogPost.findFirst({
      where: { slug: data.slug, NOT: { id: postId } },
    });
    if (existingSlug) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    const tags = data.tags
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const readTime = calculateReadTime(data.content);

    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        featuredImage: data.featuredImage || null,
        categoryId: data.categoryId || null,
        tags,
        status: data.status,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        readTime,
        isFeatured: data.isFeatured,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${postId}/edit`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);

    return { success: true, message: "Blog post update হয়েছে" };
  } catch (error) {
    console.error("Update blog post error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// DELETE BLOG POST
// ==================================================
export async function deleteBlogPostAction(postId: string) {
  try {
    await requireAdmin();

    await prisma.blogPost.delete({ where: { id: postId } });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return { success: true, message: "Blog post delete হয়েছে" };
  } catch (error) {
    console.error("Delete blog post error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// CATEGORY ACTIONS
// ==================================================
export async function createBlogCategoryAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = blogCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || "",
    color: formData.get("color") || "#7C3AED",
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    await prisma.blogCategory.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        color: parsed.data.color,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");

    return { success: true, message: "Category তৈরি হয়েছে" };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

export async function deleteBlogCategoryAction(categoryId: string) {
  try {
    await requireAdmin();

    await prisma.blogCategory.delete({ where: { id: categoryId } });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");

    return { success: true, message: "Category delete হয়েছে" };
  } catch (error) {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}