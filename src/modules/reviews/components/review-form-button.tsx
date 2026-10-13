"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

import { ReviewForm } from "./review-form";

export function ReviewFormButton({
  productId,
  orderId,
  productName,
  variantName,
  productThumbnail,
  productIcon,
  existingReview,
}: {
  productId: string;
  orderId: string;
  productName: string;
  variantName: string | null;
  productThumbnail: string | null;
  productIcon: string | null;
  existingReview?: {
    id: string;
    rating: number;
    title: string | null;
    content: string;
    imageUrl: string | null;
  } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
          existingReview
            ? "bg-bg-secondary border border-border text-text-primary hover:border-primary"
            : "bg-gradient-primary text-white"
        }`}
      >
        <Star className="w-3.5 h-3.5" />
        {existingReview ? "Edit Review" : "Write a Review"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border rounded-xl max-w-lg w-full my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/15 to-bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {productThumbnail ? (
                    <img
                      src={productThumbnail}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : productIcon ? (
                    <span className="text-xl">{productIcon}</span>
                  ) : (
                    <span className="text-xl">🎮</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-text-primary text-sm truncate">
                    {productName}
                  </div>
                  {variantName && (
                    <div className="text-xs text-text-muted truncate">
                      {variantName}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              <ReviewForm
                mode={existingReview ? "edit" : "create"}
                reviewId={existingReview?.id}
                productId={productId}
                orderId={orderId}
                productName={productName}
                initialData={
                  existingReview
                    ? {
                        rating: existingReview.rating,
                        title: existingReview.title || "",
                        content: existingReview.content,
                        imageUrl: existingReview.imageUrl || "",
                      }
                    : undefined
                }
                onSuccess={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}