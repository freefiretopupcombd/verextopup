import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getPostByIdAdmin } from "@/modules/blog/queries";
import { BlogPostForm } from "@/modules/blog/admin/components/blog-post-form";

export const metadata: Metadata = {
  title: "Edit Blog Post — Admin",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostByIdAdmin(id);

  if (!post) notFound();

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
        <h1 className="text-2xl font-bold text-text-primary">Edit Post</h1>
        <p className="text-text-muted text-sm mt-1 font-mono">
          /blog/{post.slug}
        </p>
      </div>

      <BlogPostForm mode="edit" postId={post.id} initialData={post} categories={categories} />
    </div>
  );
}