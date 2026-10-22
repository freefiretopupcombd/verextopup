"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { productSchema, normalizeKeywords } from "./validations";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
};

// ==================================================
// FORM PARSER
// ==================================================
function parseFormData(formData: FormData) {
  const toBool = (v: FormDataEntryValue | null) =>
    v === "on" || v === "true";

  const getString = (key: string) => {
    const val = formData.get(key);
    return typeof val === "string" ? val : "";
  };

  let variations: any[] = [];
  let fields: any[] = [];

  try {
    variations = JSON.parse((formData.get("variations") as string) || "[]");
  } catch {
    variations = [];
  }

  try {
    fields = JSON.parse((formData.get("fields") as string) || "[]");
  } catch {
    fields = [];
  }

  return {
    // ---- Basic ----
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    sku: (formData.get("sku") as string) || undefined,
    categoryId: (formData.get("categoryId") as string) || undefined,
    brand: (formData.get("brand") as string) || undefined,
    productType: formData.get("productType") || "TOPUP",
    shortDesc: (formData.get("shortDesc") as string) || undefined,
    fullDesc: (formData.get("fullDesc") as string) || undefined,
    thumbnail: (formData.get("thumbnail") as string) || undefined,
    imageAlt: (formData.get("imageAlt") as string) || undefined,
    icon: (formData.get("icon") as string) || undefined,
    price: formData.get("price") || 0,
    currency: formData.get("currency") || "BDT",
    status: formData.get("status") || "DRAFT",
    isFeatured: toBool(formData.get("isFeatured")),
    isPopular: toBool(formData.get("isPopular")),
    isNew: toBool(formData.get("isNew")),
    deliveryType: formData.get("deliveryType") || "MANUAL",
    checkoutMode: formData.get("checkoutMode") || "DIRECT",
    instructions: (formData.get("instructions") as string) || undefined,
    terms: (formData.get("terms") as string) || undefined,

    // ---- Dynamic Badges ----
    badge1Text: getString("badge1Text") || undefined,
    badge1Icon: getString("badge1Icon") || undefined,
    badge1Color: getString("badge1Color") || undefined,
    badge2Text: getString("badge2Text") || undefined,
    badge2Icon: getString("badge2Icon") || undefined,
    badge2Color: getString("badge2Color") || undefined,
    badge3Text: getString("badge3Text") || undefined,
    badge3Icon: getString("badge3Icon") || undefined,
    badge3Color: getString("badge3Color") || undefined,

    // ---- SEO: Core ----
    seoTitle: (formData.get("seoTitle") as string) || undefined,
    seoDescription: (formData.get("seoDescription") as string) || undefined,
    seoKeywords: (formData.get("seoKeywords") as string) || undefined,
    canonicalUrl: (formData.get("canonicalUrl") as string) || undefined,

    // ---- SEO: Extended (2026) ----
    primaryKeyword: (formData.get("primaryKeyword") as string) || undefined,
    secondaryKeywords:
      (formData.get("secondaryKeywords") as string) || undefined,
    ogTitle: (formData.get("ogTitle") as string) || undefined,
    ogDescription: (formData.get("ogDescription") as string) || undefined,
    ogImage: (formData.get("ogImage") as string) || undefined,
    twitterCard:
      (formData.get("twitterCard") as string) || "summary_large_image",
    twitterImage: (formData.get("twitterImage") as string) || undefined,
    isIndexable: toBool(formData.get("isIndexable")),
    isFollowable: toBool(formData.get("isFollowable")),
    breadcrumbLabel:
      (formData.get("breadcrumbLabel") as string) || undefined,

    // ---- Relations ----
    variations,
    fields,
  };
}

// ==================================================
// BUILD SEO DATA
// ==================================================
function buildSeoData(data: any) {
  return {
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    seoKeywords: data.seoKeywords || null,
    canonicalUrl: data.canonicalUrl || null,

    primaryKeyword: data.primaryKeyword || null,
    secondaryKeywords: data.secondaryKeywords || null,
    ogTitle: data.ogTitle || null,
    ogDescription: data.ogDescription || null,
    ogImage: data.ogImage || null,
    twitterCard: data.twitterCard || "summary_large_image",
    twitterImage: data.twitterImage || null,
    isIndexable: data.isIndexable,
    isFollowable: data.isFollowable,
    breadcrumbLabel: data.breadcrumbLabel || null,
  };
}

// ==================================================
// BUILD BADGE DATA
// ==================================================
function buildBadgeData(data: any) {
  return {
    badge1Text: data.badge1Text || null,
    badge1Icon: data.badge1Icon || null,
    badge1Color: data.badge1Color || null,
    badge2Text: data.badge2Text || null,
    badge2Icon: data.badge2Icon || null,
    badge2Color: data.badge2Color || null,
    badge3Text: data.badge3Text || null,
    badge3Icon: data.badge3Icon || null,
    badge3Color: data.badge3Color || null,
  };
}

// ==================================================
// CREATE PRODUCT
// ==================================================
export async function createProductAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = productSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

console.log("========== DEBUG IMAGE ALT ==========");
console.log("FormData imageAlt:", formData.get("imageAlt"));
console.log("Parsed data imageAlt:", data.imageAlt);
console.log("====================================");

  try {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    if (data.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        return {
          success: false,
          errors: { sku: ["এই SKU আগেই ব্যবহার হয়েছে"] },
        };
      }
    }

    for (const v of data.variations) {
      if (v.sku) {
        const existing = await prisma.productVariant.findUnique({
          where: { sku: v.sku },
        });
        if (existing) {
          return {
            success: false,
            message: `Variation SKU "${v.sku}" আগেই ব্যবহৃত`,
          };
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        // ---- Basic ----
        name: data.name,
        slug: data.slug,
        sku: data.sku || null,
        categoryId: data.categoryId || null,
        brand: data.brand || null,
        productType: data.productType,
        shortDesc: data.shortDesc || null,
        fullDesc: data.fullDesc || null,
        thumbnail: data.thumbnail || null,
        imageAlt: data.imageAlt || null,
        icon: data.icon || null,
        price: data.price,
        currency: data.currency,
        status: data.status,
        isFeatured: data.isFeatured,
        isPopular: data.isPopular,
        isNew: data.isNew,
        deliveryType: data.deliveryType,
        checkoutMode: data.checkoutMode,
        instructions: data.instructions || null,
        terms: data.terms || null,

        // ---- Dynamic Badges ✅ ----
        ...buildBadgeData(data),

        // ---- SEO ----
        ...buildSeoData(data),

        // ---- Relations ----
        variants: {
  create: data.variations.map((v, i) => ({
    name: v.name,
    sku: v.sku || null,
    price: v.price,
    salePrice:
      v.salePrice !== "" && v.salePrice !== null
        ? Number(v.salePrice)
        : null,
    costPrice:
      v.costPrice !== "" && v.costPrice !== null
        ? Number(v.costPrice)
        : null,
    usdtPrice:                                    // ← ✅ নতুন
      v.usdtPrice !== "" && v.usdtPrice !== null
        ? Number(v.usdtPrice)
        : null,
    stock:
      v.stock !== "" && v.stock !== null ? Number(v.stock) : null,
    unlimitedStock: v.unlimitedStock,
    status: v.status,
    customFields: v.icon ? { icon: v.icon } : undefined,
    sortOrder: v.sortOrder ?? i,
  })),
},
        fields: {
          create: data.fields.map((f, i) => ({
            label: f.label,
            name: f.name,
            fieldType: f.fieldType,
            placeholder: f.placeholder || null,
            helpText: f.helpText || null,
            required: f.required,
            minLength:
              f.minLength !== "" && f.minLength !== null
                ? Number(f.minLength)
                : null,
            maxLength:
              f.maxLength !== "" && f.maxLength !== null
                ? Number(f.maxLength)
                : null,
            regex: f.regex || null,
            defaultValue: f.defaultValue || null,
            sortOrder: f.sortOrder ?? i,
            options: f.options.length
              ? {
                  create: f.options.map((o, oi) => ({
                    label: o.label,
                    value: o.value,
                    sortOrder: oi,
                  })),
                }
              : undefined,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      message: "Product সফলভাবে তৈরি হয়েছে",
      data: product,
    };
  } catch (error) {
    console.error("Create product error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// UPDATE PRODUCT
// ==================================================
export async function updateProductAction(
  productId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = productSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    console.error(
      "[UPDATE PRODUCT] Validation failed:",
      z.flattenError(parsed.error).fieldErrors
    );
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

console.log("========== DEBUG IMAGE ALT ==========");
console.log("FormData imageAlt:", formData.get("imageAlt"));
console.log("Parsed data imageAlt:", data.imageAlt);
console.log("====================================");

  try {
    const existingSlug = await prisma.product.findFirst({
      where: { slug: data.slug, NOT: { id: productId } },
    });
    if (existingSlug) {
      return {
        success: false,
        errors: { slug: ["এই slug আগেই ব্যবহার হয়েছে"] },
      };
    }

    if (data.sku) {
      const existingSku = await prisma.product.findFirst({
        where: { sku: data.sku, NOT: { id: productId } },
      });
      if (existingSku) {
        return {
          success: false,
          errors: { sku: ["এই SKU আগেই ব্যবহার হয়েছে"] },
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update product basic + SEO + badges
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku || null,
          categoryId: data.categoryId || null,
          brand: data.brand || null,
          productType: data.productType,
          shortDesc: data.shortDesc || null,
          fullDesc: data.fullDesc || null,
          thumbnail: data.thumbnail || null,
          imageAlt: data.imageAlt || null,
          icon: data.icon || null,
          price: data.price,
          currency: data.currency,
          status: data.status,
          isFeatured: data.isFeatured,
          isPopular: data.isPopular,
          isNew: data.isNew,
          deliveryType: data.deliveryType,
          checkoutMode: data.checkoutMode,
          instructions: data.instructions || null,
          terms: data.terms || null,

          // ✅ Dynamic Badges
          ...buildBadgeData(data),

          // ✅ SEO
          ...buildSeoData(data),
        },
      });

      // 2. Existing variations
      const existingVariants = await tx.productVariant.findMany({
        where: { productId },
        select: { id: true },
      });

      const existingIds = new Set(existingVariants.map((v) => v.id));
      const keptIds = new Set<string>();

      // 3. UPSERT variations
      for (let i = 0; i < data.variations.length; i++) {
        const v = data.variations[i] as any;
        const variantData = {
  name: v.name,
  sku: v.sku || null,
  price: v.price,
  salePrice:
    v.salePrice !== "" && v.salePrice !== null
      ? Number(v.salePrice)
      : null,
  costPrice:
    v.costPrice !== "" && v.costPrice !== null
      ? Number(v.costPrice)
      : null,
  usdtPrice:                                      // ← ✅ নতুন
    v.usdtPrice !== "" && v.usdtPrice !== null
      ? Number(v.usdtPrice)
      : null,
  stock:
    v.stock !== "" && v.stock !== null ? Number(v.stock) : null,
  unlimitedStock: v.unlimitedStock,
  status: v.status,
  customFields: v.icon ? { icon: v.icon } : undefined,
  sortOrder: v.sortOrder ?? i,
};
        if (v.id && existingIds.has(v.id)) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: variantData,
          });
          keptIds.add(v.id);
        } else {
          const created = await tx.productVariant.create({
            data: {
              productId,
              ...variantData,
            },
          });
          keptIds.add(created.id);
        }
      }

      // 4. Remove deleted variations
      const toRemove = existingVariants
        .filter((v) => !keptIds.has(v.id))
        .map((v) => v.id);

      if (toRemove.length > 0) {
        const withOrders = await tx.orderItem.findMany({
          where: { variantId: { in: toRemove } },
          select: { variantId: true },
        });

        const idsWithOrders = new Set(
          withOrders.map((oi) => oi.variantId).filter(Boolean)
        );

        const safeToDelete = toRemove.filter(
          (id) => !idsWithOrders.has(id)
        );
        const mustKeep = toRemove.filter((id) => idsWithOrders.has(id));

        if (mustKeep.length > 0) {
          await tx.productVariant.updateMany({
            where: { id: { in: mustKeep } },
            data: { status: "INACTIVE" },
          });
        }

        if (safeToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: safeToDelete } },
          });
        }
      }

      // 5. Recreate fields
      await tx.productField.deleteMany({ where: { productId } });

      for (let i = 0; i < data.fields.length; i++) {
        const f = data.fields[i];
        await tx.productField.create({
          data: {
            productId,
            label: f.label,
            name: f.name,
            fieldType: f.fieldType,
            placeholder: f.placeholder || null,
            helpText: f.helpText || null,
            required: f.required,
            minLength:
              f.minLength !== "" && f.minLength !== null
                ? Number(f.minLength)
                : null,
            maxLength:
              f.maxLength !== "" && f.maxLength !== null
                ? Number(f.maxLength)
                : null,
            regex: f.regex || null,
            defaultValue: f.defaultValue || null,
            sortOrder: f.sortOrder ?? i,
            options: f.options.length
              ? {
                  create: f.options.map((o, oi) => ({
                    label: o.label,
                    value: o.value,
                    sortOrder: oi,
                  })),
                }
              : undefined,
          },
        });
      }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath("/products");

    return {
      success: true,
      message: "Product সফলভাবে update হয়েছে",
    };
  } catch (error) {
    console.error("Update product error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// DELETE PRODUCT
// ==================================================
export async function deleteProductAction(productId: string) {
  try {
    await requireAdmin();

    await prisma.$transaction(async (tx) => {
      await tx.productField.deleteMany({ where: { productId } });

      const variants = await tx.productVariant.findMany({
        where: { productId },
        select: { id: true },
      });

      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await tx.orderItem.updateMany({
          where: { variantId: { in: variantIds } },
          data: { variantId: null },
        });

        await tx.productVariant.deleteMany({ where: { productId } });
      }

      await tx.orderItem.updateMany({
        where: { productId },
        data: { productId: null },
      });

      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productRelation.deleteMany({
        where: {
          OR: [{ fromProductId: productId }, { toProductId: productId }],
        },
      });

      await tx.review.deleteMany({ where: { productId } });
      await tx.fAQ.deleteMany({ where: { productId } });
      await tx.apiProduct.deleteMany({ where: { productId } });

      await tx.product.delete({ where: { id: productId } });
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      message: "Product delete হয়েছে (orders safe আছে)",
    };
  } catch (error) {
    console.error("Delete product error:", error);
    return {
      success: false,
      message: "Delete failed — কিছু ভুল হয়েছে",
    };
  }
}