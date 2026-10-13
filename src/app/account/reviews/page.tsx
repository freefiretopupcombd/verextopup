import type { Metadata } from "next";
import Link from "next/link";
import { Star, ShieldCheck, Clock, CheckCircle2, XCircle, PenSquare } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getUserReviews } from "@/modules/reviews/queries";

export const metadata: Metadata = {
  title: "My Reviews — VerexTopUp",
};

export default async function ReviewsPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;
  const reviews = await getUserReviews(userId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            আমার রিভিউ
          </h1>
          <p className="text-sm text-text-muted mt-1">
            আপনি যে product-গুলোতে review দিয়েছেন
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-gradient-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <PenSquare className="w-4 h-4" />
          নতুন Review দিন
        </Link>
      </div>

      {/* Info card */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-xs text-text-secondary leading-relaxed">
          ℹ️ <strong className="text-text-primary">কীভাবে review দেবেন:</strong>{" "}
          যেকোনো product page-এ যান → "Write a Review" button click করুন →
          rating + আপনার মতামত দিন → Submit করুন। Admin approve করার পরে
          public-এ দেখাবে।
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Star className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            এখনো কোনো রিভিউ নেই
          </h2>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            যেকোনো product page-এ যান এবং "Write a Review" button click করে
            আপনার মতামত শেয়ার করুন।
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-5 py-2.5 rounded-lg transition"
          >
            Products দেখুন
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-bg-card border border-border rounded-xl p-4"
            >
              {/* Product */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/15 to-bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {review.product.thumbnail ? (
                    <img
                      src={review.product.thumbnail}
                      alt={review.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : review.product.icon ? (
                    <span className="text-2xl">{review.product.icon}</span>
                  ) : (
                    <span className="text-2xl">🎮</span>
                  )}
                </div>
                <Link
                  href={`/products/${review.product.slug}`}
                  className="flex-1 min-w-0"
                >
                  <div className="text-sm font-medium text-text-primary truncate hover:text-primary transition">
                    {review.product.name}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </Link>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                    review.status === "APPROVED"
                      ? "bg-success/15 text-success"
                      : review.status === "REJECTED"
                        ? "bg-danger/15 text-danger"
                        : review.status === "HIDDEN"
                          ? "bg-text-muted/15 text-text-muted"
                          : "bg-warning/15 text-warning"
                  }`}
                >
                  {review.status === "APPROVED" && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {review.status === "REJECTED" && (
                    <XCircle className="w-3 h-3" />
                  )}
                  {review.status === "PENDING" && (
                    <Clock className="w-3 h-3" />
                  )}
                  {review.status}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <= review.rating
                          ? "text-warning fill-warning"
                          : "text-text-dim"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-text-primary">
                  {review.rating}/5
                </span>
                {review.isVerifiedPurchase && (
                  <span className="text-[10px] text-success flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
              </div>

              {review.title && (
                <div className="font-medium text-text-primary text-sm mb-1">
                  {review.title}
                </div>
              )}

              <p className="text-sm text-text-secondary leading-relaxed">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}