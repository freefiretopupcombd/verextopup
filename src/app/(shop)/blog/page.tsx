import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

import {
  listPublishedPosts,
  listBlogCategories,
} from "@/modules/blog/queries";

export const metadata: Metadata = {
  title: "Blog — VerexTopUp",
  description: "গেমিং tips, guides, tutorials এবং updates",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const categorySlug = params.category;

  const [data, categories] = await Promise.all([
    listPublishedPosts({ categorySlug, page, perPage: 9 }),
    listBlogCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
          Blog
        </h1>
        <p className="text-text-muted mt-2 max-w-lg mx-auto">
          গেমিং tips, guides, tutorials এবং VerexTopUp updates
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 justify-center">
          <Link
            href="/blog"
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              !categorySlug
                ? "bg-primary text-white"
                : "bg-bg-card border border-border text-text-secondary hover:border-border-light"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?category=${c.slug}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                categorySlug === c.slug
                  ? "bg-primary text-white"
                  : "bg-bg-card border border-border text-text-secondary hover:border-border-light"
              }`}
            >
              {c.name} ({c.postCount})
            </Link>
          ))}
        </div>
      )}

      {/* Posts */}
      {data.posts.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted">এখনো কোনো blog post নেই</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:-translate-y-0.5 transition-all"
            >
              {/* Image */}
              <div className="aspect-[16/10] bg-gradient-to-br from-primary/15 to-bg-secondary overflow-hidden">
                {p.featuredImage ? (
                  <img
                    src={p.featuredImage}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    📝
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {p.category && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2"
                    style={{
                      backgroundColor: `${p.category.color}15`,
                      color: p.category.color || "#7C3AED",
                    }}
                  >
                    {p.category.name}
                  </span>
                )}

                <h2 className="font-bold text-text-primary text-base leading-tight mb-2 group-hover:text-primary transition line-clamp-2">
                  {p.title}
                </h2>

                {p.excerpt && (
                  <p className="text-sm text-text-muted line-clamp-2 mb-3">
                    {p.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-text-muted pt-3 border-t border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {p.publishedAt &&
                        new Date(p.publishedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.readTime} min
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:text-primary transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          {Array.from({ length: data.totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === data.page;
            const newParams = new URLSearchParams(params);
            if (p === 1) newParams.delete("page");
            else newParams.set("page", String(p));

            return (
              <Link
                key={p}
                href={`/blog?${newParams.toString()}`}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition flex items-center justify-center ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-bg-card text-text-secondary hover:border-primary hover:text-primary"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}