import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/modules/blog/admin/components/blog-post-form";

export const metadata: Metadata = {
  title: "New Blog Post — Admin",
};

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

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
          New Blog Post
        </h1>
      </div>

      <BlogPostForm mode="create" categories={categories} />
    </div>
  );
}