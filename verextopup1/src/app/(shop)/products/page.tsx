import type { Metadata } from "next";
import Link from "next/link";

import { listProducts } from "@/modules/products/queries";
import { Price } from "@/modules/currency/components/price";

export const metadata: Metadata = {
  title: "সব Products — VerexTopUp",
  description: "সব ধরনের game top-up, gift card এবং subscription",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { sort, q } = await searchParams;

  const { products, total } = await listProducts({
    search: q,
    sort: (sort as any) || "newest",
    limit: 24,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-content">
          সব Products
        </h1>
        <p className="text-content-muted text-sm mt-1">
          মোট {total} টা product
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <h2 className="text-lg font-bold text-content mb-2">
            এখনো কোনো product নেই
          </h2>
          <p className="text-content-muted text-sm">
            শীঘ্রই আসছে!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-card flex items-center justify-center">
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : p.icon ? (
                  <div className="text-4xl sm:text-5xl">{p.icon}</div>
                ) : (
                  <div className="text-4xl sm:text-5xl">🎮</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-content text-sm truncate group-hover:text-primary transition">
                  {p.name}
                </h3>
                {p.firstVariant && (
                  <div className="mt-1">
                    <Price
                      amountBDT={p.firstVariant.salePrice ?? p.firstVariant.price}
                      className="font-bold text-primary text-sm"
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}