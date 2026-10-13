"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  EyeOff,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  updateReviewStatusAction,
  replyToReviewAction,
  deleteReplyAction,
} from "../../actions";

export function AdminReviewView({ review }: { review: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [replyText, setReplyText] = useState("");

  const handleStatus = (status: "APPROVED" | "REJECTED" | "HIDDEN") => {
    startTransition(async () => {
      const result = await updateReviewStatusAction(review.id, status);
      if (result.success) {
        toast.success("Status update হয়েছে");
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleReply = () => {
    if (replyText.trim().length < 2) {
      toast.error("Reply লিখুন");
      return;
    }

    const formData = new FormData();
    formData.set("reviewId", review.id);
    formData.set("content", replyText);

    startTransition(async () => {
      const result = await replyToReviewAction({ success: false }, formData);
      if (result.success) {
        toast.success("Reply যোগ হয়েছে");
        setReplyText("");
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleDeleteReply = (replyId: string) => {
    startTransition(async () => {
      const result = await deleteReplyAction(replyId);
      if (result.success) {
        toast.success("Reply delete হয়েছে");
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
      {/* LEFT */}
      <div className="space-y-5">
        {/* Review card */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          {/* User */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
              {review.user.avatar ? (
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                (review.user.name || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-text-primary text-sm">
                {review.user.name || "Unknown"}
              </div>
              <div className="text-xs text-text-muted truncate">
                {review.user.email}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
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
            <span className="font-bold text-text-primary text-sm">
              {review.rating}/5
            </span>
            {review.isVerifiedPurchase && (
              <span className="text-[10px] text-success flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            )}
          </div>

          {/* Title */}
          {review.title && (
            <div className="font-medium text-text-primary text-base mb-2">
              {review.title}
            </div>
          )}

          {/* Content */}
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {review.content}
          </p>

          {/* Image */}
          {review.imageUrl && (
            <div className="mt-4">
              <img
                src={review.imageUrl}
                alt="Review"
                className="max-w-md rounded-lg border border-border"
              />
            </div>
          )}

          {/* Product */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-2">
              Product
            </div>
            <Link
              href={`/products/${review.product.slug}`}
              target="_blank"
              className="text-sm text-primary hover:underline"
            >
              {review.product.name}
            </Link>
          </div>

          <div className="mt-3 text-[10px] text-text-dim">
            Submitted:{" "}
            {new Date(review.createdAt).toLocaleString("en-GB")}
          </div>
        </div>

        {/* Replies */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold text-text-primary text-sm mb-4">
            Replies ({review.replies.length})
          </h2>

          {review.replies.length > 0 && (
            <div className="space-y-3 mb-4">
              {review.replies.map((reply: any) => (
                <div
                  key={reply.id}
                  className="bg-primary/5 border-l-2 border-primary rounded-r-lg p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      VerexTopUp Team
                    </div>
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      disabled={isPending}
                      className="p-1 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  <div className="text-[10px] text-text-dim mt-2">
                    {new Date(reply.createdAt).toLocaleString("en-GB")}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          <div className="space-y-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              placeholder="Reply লিখুন..."
              className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
            />
            <button
              onClick={handleReply}
              disabled={isPending || replyText.trim().length < 2}
              className="inline-flex items-center gap-2 bg-gradient-primary text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Reply পাঠান
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — Actions */}
      <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div className="bg-bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-text-primary text-sm mb-2">
            Status
          </h2>

          <div className="text-sm mb-4">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                review.status === "APPROVED"
                  ? "bg-success/15 text-success"
                  : review.status === "REJECTED"
                    ? "bg-danger/15 text-danger"
                    : review.status === "HIDDEN"
                      ? "bg-text-muted/15 text-text-muted"
                      : "bg-warning/15 text-warning"
              }`}
            >
              {review.status}
            </span>
          </div>

          {/* Action buttons */}
          {review.status !== "APPROVED" && (
            <button
              onClick={() => handleStatus("APPROVED")}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-semibold py-2.5 rounded-lg transition text-sm disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
          )}

          {review.status !== "REJECTED" && (
            <button
              onClick={() => handleStatus("REJECTED")}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-danger hover:bg-danger/90 text-white font-semibold py-2.5 rounded-lg transition text-sm disabled:opacity-60"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          )}

          {review.status !== "HIDDEN" && (
            <button
              onClick={() => handleStatus("HIDDEN")}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-bg-secondary border border-border hover:border-primary text-text-primary font-medium py-2.5 rounded-lg transition text-sm disabled:opacity-60"
            >
              <EyeOff className="w-4 h-4" />
              Hide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}