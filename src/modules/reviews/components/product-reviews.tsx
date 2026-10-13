"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PenSquare,
  X,
  CheckCircle2,
} from "lucide-react";

import { ReviewForm } from "./review-form";

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

export function ProductReviews({
  productId,
  productName,
  reviews,
  totalReviews,
  averageRating,
  isLoggedIn,
  hasReviewed,
}: {
  productId: string;
  productName: string;
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  isLoggedIn: boolean;
  hasReviewed: boolean;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary">
          Customer Reviews
        </h2>

        {/* Action button */}
        {!isLoggedIn ? (
          <Link
            href="/login"
            className="bg-bg-card border border-border hover:border-primary text-text-primary text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Login to Review
          </Link>
        ) : hasReviewed ? (
          <Link
            href="/account/reviews"
            className="bg-bg-card border border-primary text-primary text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            You reviewed — Edit
          </Link>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-primary text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            <PenSquare className="w-3.5 h-3.5" />
            Write a Review
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-bg-card border border-primary/30 rounded-xl p-4 sm:p-5 mb-5 relative">
          <button
            onClick={() => setShowForm(false)}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="font-bold text-text-primary text-base mb-4 pr-8">
            Write Your Review
          </h3>

          <ReviewForm
            productId={productId}
            orderId={null}
            productName={productName}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

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
          <p className="text-text-muted text-sm mb-1">
            এখনো কোনো review নেই
          </p>
          <p className="text-xs text-text-muted">
            প্রথম review দিয়ে অন্য customer-দের সাহায্য করুন!
          </p>
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
                    {r.isVerifiedPurchase && (
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
        </div>
      )}
    </section>
  );
}