import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/modules/categories/components/category-form";

export const metadata: Metadata = {
  title: "Edit Category — Admin",
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-content-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Categories-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-content">Category Edit</h1>
        <p className="text-content-muted text-sm mt-1 font-mono">
          /{category.slug}
        </p>
      </div>

      <CategoryForm
        mode="edit"
        categoryId={category.id}
        initialData={{
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          icon: category.icon,
          parentId: category.parentId,
          sortOrder: category.sortOrder,
          status: category.status,
          isFeatured: category.isFeatured,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          seoKeywords: category.seoKeywords,
        }}
        categories={categories}
      />
    </div>
  );
}