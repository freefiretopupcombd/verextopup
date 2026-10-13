import Link from "next/link";
import { Package, ExternalLink } from "lucide-react";

export function TopProductsList({
  products,
}: {
  products: {
    productId: string | null;
    productName: string;
    productIcon: string | null;
    productSlug: string | null;
    revenue: number;
    quantity: number;
    orderCount: number;
  }[];
}) {
  if (products.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
        <Package className="w-8 h-8 text-text-muted mx-auto mb-2" />
        <p className="text-text-muted text-sm">
          এই সময়ে কোনো sale নেই
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-bold text-text-primary text-sm">
          🏆 Top Selling Products
        </h3>
      </div>
      <div className="divide-y divide-border">
        {products.map((p, idx) => (
          <div
            key={p.productId}
            className="flex items-center gap-3 p-3 hover:bg-bg-secondary/40 transition"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {idx + 1}
            </div>
            <div className="text-xl shrink-0">{p.productIcon || "📦"}</div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/admin/products/${p.productId}/edit`}
                className="text-sm font-medium text-text-primary truncate hover:text-primary inline-flex items-center gap-1"
              >
                {p.productName}
                <ExternalLink className="w-3 h-3" />
              </Link>
              <div className="text-[10px] text-text-muted mt-0.5">
                {p.orderCount} orders · {p.quantity} units
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-success">
                ৳{p.revenue.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}