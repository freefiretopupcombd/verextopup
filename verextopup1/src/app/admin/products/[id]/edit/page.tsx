import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/modules/products/components/product-form";

export const metadata: Metadata = {
  title: "Edit Product — Admin",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
      fields: {
        orderBy: { sortOrder: "asc" },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  const initialData = {
    // ==========================================
    // Basic
    // ==========================================
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId,
    brand: product.brand,
    productType: product.productType,
    shortDesc: product.shortDesc,
    fullDesc: product.fullDesc,
    thumbnail: product.thumbnail,
    icon: product.icon,
    price: Number(product.price),
    currency: product.currency,
    status: product.status,
    isFeatured: product.isFeatured,
    isPopular: product.isPopular,
    isNew: product.isNew,
    deliveryType: product.deliveryType,
    checkoutMode: product.checkoutMode,
    instructions: product.instructions,
    terms: product.terms,

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

    // Badges
    badge1Text: product.badge1Text,
    badge1Icon: product.badge1Icon,
    badge1Color: product.badge1Color,
    badge2Text: product.badge2Text,
    badge2Icon: product.badge2Icon,
    badge2Color: product.badge2Color,
    badge3Text: product.badge3Text,
    badge3Icon: product.badge3Icon,
    badge3Color: product.badge3Color,

    // ==========================================
    // Relations
    // ==========================================
    variations: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku || "",
      price: Number(v.price),
      salePrice: v.salePrice ? Number(v.salePrice) : "",
      costPrice: v.costPrice ? Number(v.costPrice) : "",
      stock: v.stock ?? "",
      unlimitedStock: v.unlimitedStock,
      status: v.status as "ACTIVE" | "INACTIVE",
      icon: (v.customFields as any)?.icon || "",
      sortOrder: v.sortOrder,
    })),

    fields: product.fields.map((f) => ({
      id: f.id,
      label: f.label,
      name: f.name,
      fieldType: f.fieldType as any,
      placeholder: f.placeholder || "",
      helpText: f.helpText || "",
      required: f.required,
      minLength: f.minLength ?? "",
      maxLength: f.maxLength ?? "",
      regex: f.regex || "",
      defaultValue: f.defaultValue || "",
      sortOrder: f.sortOrder,
      options: f.options.map((o) => ({
        label: o.label,
        value: o.value,
      })),
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Products-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Product Edit</h1>
        <p className="text-text-muted text-sm mt-1 font-mono">
          /products/{product.slug}
        </p>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        initialData={initialData}
        categories={categories}
      />
    </div>
  );
}