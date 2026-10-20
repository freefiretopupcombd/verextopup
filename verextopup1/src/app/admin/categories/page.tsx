import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FolderTree } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { CategoryTable } from "@/modules/categories/components/category-table";

export const metadata: Metadata = {
  title: "Categories — Admin",
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: {
        select: { id: true, name: true },
      },
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">Categories</h1>
          <p className="text-content-muted text-sm mt-1">
            মোট {categories.length} টা category
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          নতুন Category
        </Link>
      </div>

      {/* Table or Empty state */}
      {categories.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card border border-border p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <FolderTree className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-content mb-2">
            এখনো কোনো category নেই
          </h2>
          <p className="text-content-muted text-sm mb-6">
            প্রথম category তৈরি করুন — যেমন "Free Fire" বা "PUBG Mobile"
          </p>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            প্রথম Category তৈরি করুন
          </Link>
        </div>
      ) : (
        <CategoryTable categories={categories} />
      )}
    </div>
  );
}