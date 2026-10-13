"use client";

import { Star, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  imageUrl?: string | null;
  isVerifiedPurchase?: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  replies?: { id: string; content: string; createdAt: string }[];
};

export function CustomerReviews({
  reviews,
  totalReviews,
  averageRating,
}: {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}) {
  return (
    <section className="mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary">
          Customer Reviews
        </h2>
        <button className="bg-gradient-primary text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
          Write a Review
        </button>
      </div>

      {/* Summary */}
      {totalReviews > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-text-primary">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-text-muted">out of 5</span>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.round(averageRating)
                      ? "text-warning fill-warning"
                      : "text-text-dim"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-text-muted">
              ({totalReviews.toLocaleString()} reviews)
            </span>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <Star className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted text-sm">এখনো কোনো review নেই।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold shrink-0 overflow-hidden">
                  {r.user.avatar ? (
                    <img
                      src={r.user.avatar}
                      alt={r.user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (r.user.name || "U").charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-primary text-sm">
                      {r.user.name || "Anonymous"}
                    </span>
                    {(r.isVerifiedPurchase ?? true) && (
                      <span className="text-[10px] text-success flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i <= r.rating
                              ? "text-warning fill-warning"
                              : "text-text-dim"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-text-muted">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {r.title && (
                    <div className="font-medium text-text-primary text-sm mt-2">
                      {r.title}
                    </div>
                  )}
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                    {r.content}
                  </p>

                  {r.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={r.imageUrl}
                        alt="Review"
                        className="max-w-xs rounded-lg border border-border"
                      />
                    </div>
                  )}

                  {/* Admin replies */}
                  {r.replies && r.replies.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {r.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-primary/5 border-l-2 border-primary rounded-r-lg p-3"
                        >
                          <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                            VerexTopUp Team
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Carousel arrows (decorative) */}
          {reviews.length > 2 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button className="w-8 h-8 rounded-lg border border-border bg-bg-card flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg border border-border bg-bg-card flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}