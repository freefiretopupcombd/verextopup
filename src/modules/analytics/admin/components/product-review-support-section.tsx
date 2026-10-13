import { Package, Star, Headphones, AlertCircle } from "lucide-react";

export function ProductReviewSupportSection({
  product,
  review,
  support,
}: {
  product: {
    total: number;
    byStatus: { status: string; count: number }[];
    categories: { id: string; name: string; productCount: number }[];
    outOfStock: number;
  };
  review: {
    total: number;
    average: number;
    byStatus: { status: string; count: number }[];
    byRating: { rating: number; count: number }[];
  };
  support: {
    totalTickets: number;
    byStatus: { status: string; count: number }[];
    byCategory: { category: string; count: number }[];
    contactMessages: number;
    openContacts: number;
  };
}) {
  const activeProducts =
    product.byStatus.find((s) => s.status === "ACTIVE")?.count || 0;
  const draftProducts =
    product.byStatus.find((s) => s.status === "DRAFT")?.count || 0;

  const openTickets =
    support.byStatus.find((s) => s.status === "OPEN")?.count || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Products */}
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-text-primary text-sm">Products</h3>
        </div>
        <div className="space-y-2">
          <Row label="Total" value={product.total} />
          <Row label="Active" value={activeProducts} color="text-success" />
          <Row label="Draft" value={draftProducts} color="text-warning" />
          {product.outOfStock > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-danger mt-2 pt-2 border-t border-border">
              <AlertCircle className="w-3 h-3" />
              {product.outOfStock} products out of stock
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-warning" />
          <h3 className="font-bold text-text-primary text-sm">Reviews</h3>
        </div>
        <div className="space-y-2">
          <Row label="Total" value={review.total} />
          <Row
            label="Average Rating"
            value={`${review.average.toFixed(1)} / 5`}
            color="text-warning"
          />
          {review.byRating.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  review.byRating.find((r) => r.rating === star)?.count || 0;
                const percent =
                  review.total > 0 ? (count / review.total) * 100 : 0;
                return (
                  <div
                    key={star}
                    className="flex items-center gap-2 text-[11px]"
                  >
                    <span className="text-text-muted w-6">{star}★</span>
                    <div className="flex-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-text-muted w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Support */}
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Headphones className="w-4 h-4 text-accent" />
          <h3 className="font-bold text-text-primary text-sm">Support</h3>
        </div>
        <div className="space-y-2">
          <Row label="Tickets" value={support.totalTickets} />
          <Row label="Open" value={openTickets} color="text-warning" />
          <Row label="Contact Msgs" value={support.contactMessages} />
          {support.openContacts > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-warning mt-2 pt-2 border-t border-border">
              <AlertCircle className="w-3 h-3" />
              {support.openContacts} unread contact messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  color = "text-text-primary",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-text-muted">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}