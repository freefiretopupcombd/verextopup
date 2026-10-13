import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { listBlogCategories } from "@/modules/blog/queries";
import { CategoryManager } from "@/modules/blog/admin/components/category-manager";

export const metadata: Metadata = {
  title: "Blog Categories — Admin",
};

export default async function BlogCategoriesPage() {
  const categories = await listBlogCategories();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Blog-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          Blog Categories
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Blog post categories manage করুন
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}