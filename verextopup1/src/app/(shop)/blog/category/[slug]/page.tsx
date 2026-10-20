import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, Clock, ArrowRight } from "lucide-react";

import {
  getBlogCategoryBySlug,
  listPublishedPosts,
} from "@/modules/blog/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);

  if (!category) return { title: "Category not found" };

  return {
    title: `${category.name} — VerexTopUp Blog`,
    description: category.description || undefined,
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);

  if (!category) notFound();

  const { posts, total } = await listPublishedPosts({
    categorySlug: slug,
    perPage: 12,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-text-muted mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/blog" className="hover:text-primary">Blog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-text-secondary">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-block mb-3"
          style={{
            backgroundColor: `${category.color}15`,
            color: category.color || "#7C3AED",
          }}
        >
          Category
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-text-muted mt-2 max-w-2xl">
            {category.description}
          </p>
        )}
        <p className="text-xs text-text-muted mt-2">{total} টা post</p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-text-muted">এই category-তে কোনো post নেই</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-primary/15 to-bg-secondary">
                {p.featuredImage ? (
                  <img
                    src={p.featuredImage}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    📝
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold text-text-primary line-clamp-2 group-hover:text-primary transition mb-2">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="text-sm text-text-muted line-clamp-2 mb-3">
                    {p.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] text-text-muted pt-3 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {p.readTime} min
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:text-primary transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}