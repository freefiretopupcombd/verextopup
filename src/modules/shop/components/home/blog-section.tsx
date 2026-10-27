import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: { name: string; slug: string; color: string | null } | null;
  readTime: number;
  publishedAt: string | null;
};

export function BlogSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-lg shadow-primary/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">
              Latest from Blog
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              গেমিং tips, guides এবং updates
            </p>
          </div>
        </div>
        <Link
          href="/blog"
          className="text-xs sm:text-sm text-primary hover:underline font-medium shrink-0 ml-3 flex items-center gap-1 group"
        >
          সব দেখুন
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Posts grid — Desktop 4, Mobile 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {posts.slice(0, 4).map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Image — shorter height */}
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 via-primary/5 to-bg-secondary overflow-hidden relative">
              {post.featuredImage ? (
                <>
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl opacity-60">
                  📝
                </div>
              )}

              {/* Read time badge */}
              <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {post.readTime}m
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col">
              {/* Category */}
              {post.category && (
                <span
                  className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full inline-block mb-2 sm:mb-2.5 w-fit uppercase tracking-wider"
                  style={{
                    backgroundColor: `${post.category.color}15`,
                    color: post.category.color || "#7C3AED",
                  }}
                >
                  {post.category.name}
                </span>
              )}

              {/* Title */}
              <h3 className="font-bold text-text-primary text-xs sm:text-sm leading-snug mb-1.5 sm:mb-2 group-hover:text-primary transition line-clamp-2">
                {post.title}
              </h3>

              {/* Excerpt — desktop only */}
              {post.excerpt && (
                <p className="hidden sm:block text-xs text-text-muted line-clamp-2 leading-relaxed mb-3 flex-1">
                  {post.excerpt}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-border mt-auto">
                {post.publishedAt && (
                  <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-text-muted">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                )}

                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}