"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

import { homepageSectionSchema } from "./validations";

export type HomepageActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  sectionId?: string;
};

// ==================================================
// PARSE FORM DATA
// ==================================================
function parseSectionForm(formData: FormData) {
  const getBool = (k: string) => formData.get(k) === "on";
  const getInt = (k: string, fallback: number) => {
    const val = formData.get(k);
    if (val === null || val === "") return fallback;
    const num = parseInt(String(val), 10);
    return isNaN(num) ? fallback : num;
  };

  return {
    title: (formData.get("title") as string) || "",
    subtitle: (formData.get("subtitle") as string) || "",
    layoutType: (formData.get("layoutType") as string) || "GRID",
    sourceType: (formData.get("sourceType") as string) || "MANUAL",
    sourceCategoryId: (formData.get("sourceCategoryId") as string) || "",
    itemLimit: getInt("itemLimit", 8),
    mobileColumns: getInt("mobileColumns", 2),
    desktopColumns: getInt("desktopColumns", 4),
    isActive: getBool("isActive"),
    sortOrder: getInt("sortOrder", 0),
    viewAllUrl: (formData.get("viewAllUrl") as string) || "",
    viewAllText: (formData.get("viewAllText") as string) || "View All",
  };
}

// ==================================================
// PARSE MANUAL PRODUCT IDS
// ==================================================
function parseManualProductIds(formData: FormData): string[] {
  try {
    const raw = formData.get("productIds") as string;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

// ==================================================
// CREATE SECTION
// ==================================================
export async function createHomepageSectionAction(
  prevState: HomepageActionState,
  formData: FormData
): Promise<HomepageActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = homepageSectionSchema.safeParse(parseSectionForm(formData));

  if (!parsed.success) {
    console.error("[HOMEPAGE] Validation errors:", parsed.error);
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;
  const productIds = parseManualProductIds(formData);

  if (data.sourceType === "MANUAL" && productIds.length === 0) {
    return {
      success: false,
      errors: { productIds: ["কমপক্ষে ১টি product select করুন"] },
    };
  }

  try {
    const sourceData =
      data.sourceType === "CATEGORY" && data.sourceCategoryId
        ? { categoryId: data.sourceCategoryId }
        : null;

    console.log("[HOMEPAGE] Creating section with:", {
      title: data.title,
      mobileColumns: data.mobileColumns,
      desktopColumns: data.desktopColumns,
    });

    const section = await prisma.$transaction(async (tx) => {
      const created = await tx.homepageSection.create({
        data: {
          title: data.title,
          subtitle: data.subtitle || null,
          layoutType: data.layoutType,
          sourceType: data.sourceType,
          sourceData: sourceData as any,
          itemLimit: data.itemLimit,
          mobileColumns: data.mobileColumns,
          desktopColumns: data.desktopColumns,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          viewAllUrl: data.viewAllUrl || null,
          viewAllText: data.viewAllText || "View All",
        },
      });

      if (data.sourceType === "MANUAL" && productIds.length > 0) {
        await tx.homepageSectionProduct.createMany({
          data: productIds.map((productId, idx) => ({
            sectionId: created.id,
            productId,
            sortOrder: idx,
          })),
        });
      }

      return created;
    });

    console.log("[HOMEPAGE] Created section:", {
      id: section.id,
      mobileColumns: section.mobileColumns,
      desktopColumns: section.desktopColumns,
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return {
      success: true,
      message: "Section সফলভাবে তৈরি হয়েছে",
      sectionId: section.id,
    };
  } catch (error) {
    console.error("Create homepage section error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।" };
  }
}

// ==================================================
// UPDATE SECTION
// ==================================================
export async function updateHomepageSectionAction(
  id: string,
  prevState: HomepageActionState,
  formData: FormData
): Promise<HomepageActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = homepageSectionSchema.safeParse(parseSectionForm(formData));

  if (!parsed.success) {
    console.error("[HOMEPAGE] Update validation errors:", parsed.error);
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;
  const productIds = parseManualProductIds(formData);

  if (data.sourceType === "MANUAL" && productIds.length === 0) {
    return {
      success: false,
      errors: { productIds: ["কমপক্ষে ১টি product select করুন"] },
    };
  }

  try {
    const existing = await prisma.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Section পাওয়া যায়নি" };
    }

    const sourceData =
      data.sourceType === "CATEGORY" && data.sourceCategoryId
        ? { categoryId: data.sourceCategoryId }
        : null;

    console.log("[HOMEPAGE] Updating section with:", {
      id,
      title: data.title,
      mobileColumns: data.mobileColumns,
      desktopColumns: data.desktopColumns,
    });

    await prisma.$transaction(async (tx) => {
      const updated = await tx.homepageSection.update({
        where: { id },
        data: {
          title: data.title,
          subtitle: data.subtitle || null,
          layoutType: data.layoutType,
          sourceType: data.sourceType,
          sourceData: sourceData as any,
          itemLimit: data.itemLimit,
          mobileColumns: data.mobileColumns,
          desktopColumns: data.desktopColumns,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          viewAllUrl: data.viewAllUrl || null,
          viewAllText: data.viewAllText || "View All",
        },
      });

      console.log("[HOMEPAGE] Updated section:", {
        id: updated.id,
        mobileColumns: updated.mobileColumns,
        desktopColumns: updated.desktopColumns,
      });

      await tx.homepageSectionProduct.deleteMany({ where: { sectionId: id } });

      if (data.sourceType === "MANUAL" && productIds.length > 0) {
        await tx.homepageSectionProduct.createMany({
          data: productIds.map((productId, idx) => ({
            sectionId: id,
            productId,
            sortOrder: idx,
          })),
        });
      }
    });

    revalidatePath("/admin/homepage");
    revalidatePath(`/admin/homepage/${id}/edit`);
    revalidatePath("/");

    return { success: true, message: "Section সফলভাবে update হয়েছে" };
  } catch (error) {
    console.error("Update homepage section error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// DELETE SECTION
// ==================================================
export async function deleteHomepageSectionAction(id: string) {
  try {
    await requireAdmin();

    const section = await prisma.homepageSection.findUnique({ where: { id } });
    if (!section) return { success: false, message: "Section পাওয়া যায়নি" };

    await prisma.homepageSection.delete({ where: { id } });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return { success: true, message: "Section delete হয়েছে" };
  } catch (error) {
    console.error("Delete homepage section error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// TOGGLE ACTIVE
// ==================================================
export async function toggleHomepageSectionAction(
  id: string,
  isActive: boolean
) {
  try {
    await requireAdmin();

    await prisma.homepageSection.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return {
      success: true,
      message: isActive ? "Section চালু হয়েছে" : "Section বন্ধ হয়েছে",
    };
  } catch (error) {
    console.error("Toggle section error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// SEARCH PRODUCTS (for manual picker)
// ==================================================
export async function searchProductsForPickerAction(query: string) {
  try {
    await requireAdmin();
  } catch {
    return [];
  }

  if (!query || query.trim().length < 2) return [];

  const q = query.trim().slice(0, 50);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { soldCount: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      icon: true,
    },
  });

  return products;
}