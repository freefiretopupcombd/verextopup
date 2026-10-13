"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { categorySchema } from "./validations";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
};

// ==================================================
// CREATE CATEGORY
// ==================================================
export async function createCategoryAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
    icon: (formData.get("icon") as string) || undefined,
    parentId: (formData.get("parentId") as string) || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    status: formData.get("status") || "ACTIVE",
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: (formData.get("seoTitle") as string) || undefined,
    seoDescription: (formData.get("seoDescription") as string) || undefined,
    seoKeywords: (formData.get("seoKeywords") as string) || undefined,
    // Homepage display
    showOnHomepage: formData.get("showOnHomepage") === "on",
    homepageOrder: formData.get("homepageOrder") || 0,
    homepageTag: (formData.get("homepageTag") as string) || undefined,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        icon: data.icon || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder,
        status: data.status,
        isFeatured: data.isFeatured,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        showOnHomepage: data.showOnHomepage,
        homepageOrder: data.homepageOrder,
        homepageTag: data.homepageTag || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");

    return {
      success: true,
      message: "Category সফলভাবে তৈরি হয়েছে",
      data: category,
    };
  } catch (error) {
    console.error("Create category error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// UPDATE CATEGORY
// ==================================================
export async function updateCategoryAction(
  categoryId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
    icon: (formData.get("icon") as string) || undefined,
    parentId: (formData.get("parentId") as string) || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    status: formData.get("status") || "ACTIVE",
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: (formData.get("seoTitle") as string) || undefined,
    seoDescription: (formData.get("seoDescription") as string) || undefined,
    seoKeywords: (formData.get("seoKeywords") as string) || undefined,
    // Homepage display
    showOnHomepage: formData.get("showOnHomepage") === "on",
    homepageOrder: formData.get("homepageOrder") || 0,
    homepageTag: (formData.get("homepageTag") as string) || undefined,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.category.findFirst({
      where: {
        slug: data.slug,
        NOT: { id: categoryId },
      },
    });

    if (existing) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    if (data.parentId === categoryId) {
      return {
        success: false,
        errors: { parentId: ["নিজেকে parent বানানো যাবে না"] },
      };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        icon: data.icon || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder,
        status: data.status,
        isFeatured: data.isFeatured,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        showOnHomepage: data.showOnHomepage,
        homepageOrder: data.homepageOrder,
        homepageTag: data.homepageTag || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${categoryId}/edit`);
    revalidatePath("/categories");
    revalidatePath("/");

    return {
      success: true,
      message: "Category সফলভাবে update হয়েছে",
    };
  } catch (error) {
    console.error("Update category error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// DELETE CATEGORY
// ==================================================
export async function deleteCategoryAction(categoryId: string) {
  try {
    await requireAdmin();

    const productCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      return {
        success: false,
        message: `এই category-তে ${productCount} টা product আছে। আগে সেগুলো সরান।`,
      };
    }

    const childCount = await prisma.category.count({
      where: { parentId: categoryId },
    });

    if (childCount > 0) {
      return {
        success: false,
        message: `এই category-র ${childCount} টা sub-category আছে। আগে সেগুলো সরান।`,
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");

    return {
      success: true,
      message: "Category delete হয়েছে",
    };
  } catch (error) {
    console.error("Delete category error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে",
    };
  }
}

// ==================================================
// UPDATE HOMEPAGE ORDER (bulk)
// ==================================================
export async function updateHomepageOrderAction(
  items: { id: string; order: number }[]
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, message: "Invalid input" };
  }

  if (items.length > 100) {
    return { success: false, message: "অনেক বেশি category" };
  }

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { homepageOrder: item.order },
        })
      )
    );

    revalidatePath("/admin/categories");
    revalidatePath("/");

    return { success: true, message: "Order update হয়েছে" };
  } catch (error) {
    console.error("Update homepage order error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// TOGGLE HOMEPAGE VISIBILITY
// ==================================================
export async function toggleHomepageVisibilityAction(
  categoryId: string,
  show: boolean
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { showOnHomepage: show },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");

    return {
      success: true,
      message: show ? "Homepage এ দেখানো হবে" : "Homepage থেকে সরানো হয়েছে",
    };
  } catch (error) {
    console.error("Toggle homepage error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// FETCH CATEGORY WITH PRODUCTS (for popup)
// ==================================================
// Server action — called from client when category card clicked.
// Returns full category + active products.
// ==================================================
export async function fetchCategoryWithProductsAction(slug: string) {
  const { getCategoryWithProducts } = await import("./queries");
  return getCategoryWithProducts(slug);
}