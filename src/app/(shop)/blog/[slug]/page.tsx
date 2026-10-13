import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Tag,
  User,
  Eye,
  ChevronRight,
} from "lucide-react";

import {
  getPostBySlug,
  getRelatedPosts,
  incrementPostViews,
} from "@/modules/blog/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Post not found" };

  return {
    title: post.seoTitle || `${post.title} — VerexTopUp Blog`,
    description: post.seoDescription || post.excerpt || undefined,
    keywords: post.seoKeywords || undefined,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
      type: "article",
      publishedTime: post.publishedAt || undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // Increment view (fire and forget)
  incrementPostViews(post.id);

  const related = await getRelatedPosts(
    post.id,
    post.category?.id || null,
    3
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-text-muted mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/blog" className="hover:text-primary transition">
          Blog
        </Link>
        {post.category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/blog?category=${post.category.slug}`}
              className="hover:text-primary transition"
            >
              {post.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* Header */}
      <header className="mb-8">
        {post.category && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-block mb-3"
            style={{
              backgroundColor: `${post.category.color}15`,
              color: post.category.color || "#7C3AED",
            }}
          >
            {post.category.name}
          </span>
        )}

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary leading-tight mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-base text-text-muted leading-relaxed mb-5">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 flex-wrap text-xs text-text-muted">
          {post.author?.name && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-text-primary font-medium">
                {post.author.name}
              </span>
            </div>
          )}

          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}

          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime} min read
          </span>

          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {post.viewCount} views
          </span>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-bg-card border border-border">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <article className="prose-content">
        <div className="text-text-secondary leading-relaxed whitespace-pre-wrap text-[15px]">
          {post.content}
        </div>
      </article>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-text-muted" />
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="text-xs bg-bg-secondary border border-border hover:border-primary text-text-muted hover:text-primary px-3 py-1 rounded-full transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to blog */}
      <div className="mt-8 pt-6 border-t border-border">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          সব blog post দেখুন
        </Link>
      </div>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xl font-bold text-text-primary mb-5">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((rp) => (
              <Link
                key={rp.id}
                href={`/blog/${rp.slug}`}
                className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/15 to-bg-secondary">
                  {rp.featuredImage ? (
                    <img
                      src={rp.featuredImage}
                      alt={rp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      📝
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-primary transition">
                    {rp.title}
                  </h3>
                  <div className="text-[10px] text-text-muted mt-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {rp.readTime} min
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}