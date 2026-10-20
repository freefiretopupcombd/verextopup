"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Star,
  CheckCircle2,
  XCircle,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { updateReviewStatusAction } from "../../actions";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  isVerifiedPurchase: boolean;
  isFeatured: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string; avatar: string | null };
  product: { id: string; name: string; slug: string; icon: string | null };
  replyCount: number;
};

export function ReviewTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleStatusChange = (
    reviewId: string,
    status: "APPROVED" | "REJECTED" | "HIDDEN" | "PENDING"
  ) => {
    startTransition(async () => {
      setBusyId(reviewId);
      const result = await updateReviewStatusAction(reviewId, status);
      if (result.success) {
        toast.success("Status update হয়েছে");
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
      setBusyId(null);
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
        <p className="text-text-muted text-sm">কোনো review নেই</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">
                Review
              </th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">
                Customer
              </th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">
                Product
              </th>
              <th className="text-center px-4 py-3 font-semibold text-text-primary">
                Rating
              </th>
              <th className="text-center px-4 py-3 font-semibold text-text-primary">
                Status
              </th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border last:border-0 hover:bg-bg-secondary/50"
              >
                <td className="px-4 py-3">
                  <div className="max-w-[280px]">
                    {r.title && (
                      <div className="text-xs font-medium text-text-primary truncate">
                        {r.title}
                      </div>
                    )}
                    <div className="text-xs text-text-muted line-clamp-2 mt-0.5">
                      {r.content}
                    </div>
                    <div className="text-[10px] text-text-dim mt-1">
                      {new Date(r.createdAt).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-text-primary font-medium truncate max-w-[150px]">
                    {r.user.name || "Unknown"}
                  </div>
                  <div className="text-[10px] text-text-muted truncate max-w-[150px]">
                    {r.user.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/products/${r.product.slug}`}
                    target="_blank"
                    className="text-xs text-text-primary hover:text-primary transition truncate max-w-[150px] inline-block"
                  >
                    {r.product.icon && (
                      <span className="mr-1">{r.product.icon}</span>
                    )}
                    {r.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-0.5">
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
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === "APPROVED"
                        ? "bg-success/15 text-success"
                        : r.status === "REJECTED"
                          ? "bg-danger/15 text-danger"
                          : r.status === "HIDDEN"
                            ? "bg-text-muted/15 text-text-muted"
                            : "bg-warning/15 text-warning"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {r.status !== "APPROVED" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "APPROVED")}
                        disabled={isPending && busyId === r.id}
                        className="p-1.5 rounded hover:bg-success/10 text-text-muted hover:text-success transition"
                        title="Approve"
                      >
                        {isPending && busyId === r.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    {r.status !== "REJECTED" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "REJECTED")}
                        disabled={isPending && busyId === r.id}
                        className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition"
                        title="Reject"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {r.status !== "HIDDEN" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "HIDDEN")}
                        disabled={isPending && busyId === r.id}
                        className="p-1.5 rounded hover:bg-bg-secondary text-text-muted transition"
                        title="Hide"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Link
                      href={`/admin/reviews/${r.id}`}
                      className="p-1.5 rounded hover:bg-primary/10 text-text-muted hover:text-primary transition"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-border">
        {reviews.map((r) => (
          <Link
            key={r.id}
            href={`/admin/reviews/${r.id}`}
            className="block p-4 hover:bg-bg-secondary/50 transition"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-xs text-text-primary font-medium truncate">
                {r.user.name || "Unknown"}
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  r.status === "APPROVED"
                    ? "bg-success/15 text-success"
                    : r.status === "REJECTED"
                      ? "bg-danger/15 text-danger"
                      : "bg-warning/15 text-warning"
                }`}
              >
                {r.status}
              </span>
            </div>

            <div className="flex items-center gap-0.5 mb-2">
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

            <div className="text-xs text-text-secondary line-clamp-2">
              {r.content}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}