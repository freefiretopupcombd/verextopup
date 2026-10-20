import Link from "next/link";
import { Star, ExternalLink } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  createdAt: string;
  product: { id: string; name: string; slug: string } | null;
};

export function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <Star className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">এই user এখনো কোনো review দেয়নি</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="bg-bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < r.rating
                        ? "fill-warning text-warning"
                        : "text-text-dim"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-text-muted">{r.rating}/5</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  r.status === "APPROVED"
                    ? "bg-success/15 text-success"
                    : r.status === "PENDING"
                      ? "bg-warning/15 text-warning"
                      : "bg-danger/15 text-danger"
                }`}
              >
                {r.status}
              </span>
            </div>
            <span className="text-[10px] text-text-muted shrink-0">
              {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>

          {r.title && (
            <h4 className="font-bold text-text-primary text-sm mb-1">
              {r.title}
            </h4>
          )}
          <p className="text-sm text-text-secondary whitespace-pre-wrap">
            {r.content}
          </p>

          {r.product && (
            <Link
              href={`/admin/products/${r.product.id}/edit`}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-3"
            >
              Product: {r.product.name} <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}