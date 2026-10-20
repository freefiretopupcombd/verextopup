"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import {
  createReviewAction,
  updateReviewAction,
  type ActionState,
} from "../actions";

const initialState: ActionState = { success: false };

export function ReviewForm({
  mode = "create",
  reviewId,
  productId,
  orderId,
  productName,
  initialData,
  onSuccess,
}: {
  mode?: "create" | "edit";
  reviewId?: string;
  productId: string;
  orderId?: string | null;
  productName: string;
  initialData?: {
    rating: number;
    title: string;
    content: string;
    imageUrl: string;
  };
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [hoveredStar, setHoveredStar] = useState(0);

  const action =
    mode === "edit" && reviewId
      ? updateReviewAction.bind(null, reviewId)
      : createReviewAction;

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "সফল!");
      onSuccess?.();
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      {orderId && <input type="hidden" name="orderId" value={orderId} />}
      <input type="hidden" name="rating" value={rating} />

      {/* Product name */}
      <div className="text-xs text-text-muted">
        Product:{" "}
        <span className="text-text-primary font-medium">{productName}</span>
      </div>

      {/* Rating stars */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          আপনার রেটিং *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition ${
                  star <= (hoveredStar || rating)
                    ? "text-warning fill-warning"
                    : "text-text-dim"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-text-primary">
            {rating}/5
          </span>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Review Title (optional)
        </label>
        <input
          name="title"
          type="text"
          defaultValue={initialData?.title || ""}
          placeholder="যেমন: Excellent service!"
          className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          আপনার মতামত *
        </label>
        <textarea
          name="content"
          rows={4}
          required
          defaultValue={initialData?.content || ""}
          placeholder="Product-এর quality, delivery speed, service ইত্যাদি নিয়ে লিখুন..."
          className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary focus:outline-none focus:border-primary resize-none ${
            state.errors?.content ? "border-danger" : "border-border"
          }`}
        />
        {state.errors?.content && (
          <p className="mt-1 text-xs text-danger">
            {state.errors.content[0]}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isPending
          ? "Submitting..."
          : mode === "edit"
            ? "Update Review"
            : "Submit Review"}
      </button>

      <p className="text-[10px] text-text-muted text-center">
        Admin approve করার পরে আপনার review public-এ দেখাবে
      </p>
    </form>
  );
}