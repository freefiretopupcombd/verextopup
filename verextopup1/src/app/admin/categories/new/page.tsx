import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/modules/categories/components/category-form";

export const metadata: Metadata = {
  title: "New Category — Admin",
};

export default async function NewCategoryPage() {
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
        <h1 className="text-2xl font-bold text-content">নতুন Category</h1>
        <p className="text-content-muted text-sm mt-1">
          যেমন: Free Fire, PUBG Mobile, Gift Cards
        </p>
      </div>

      <CategoryForm mode="create" categories={categories} />
    </div>
  );
}