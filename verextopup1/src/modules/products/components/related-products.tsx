"use client";

import Link from "next/link";

import { Price } from "@/modules/currency/components/price";
import type { ProductCard } from "../queries";

export function RelatedProducts({
  products,
}: {
  products: ProductCard[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">
            Related Products
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            You might also like these products
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs text-primary hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      {/* Grid — 5 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.slice(0, 5).map((p) => (
          <div
            key={p.id}
            className="bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-light transition group"
          >
            {/* Image */}
            <Link href={`/products/${p.slug}`} className="block">
              <div className="aspect-square bg-gradient-to-br from-primary/15 via-bg-secondary to-bg-card flex items-center justify-center overflow-hidden">
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : p.icon ? (
                  <div className="text-5xl">{p.icon}</div>
                ) : (
                  <div className="text-5xl">🎮</div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="p-3">
              <Link href={`/products/${p.slug}`}>
                <h3 className="text-xs sm:text-sm font-medium text-text-primary truncate hover:text-primary transition">
                  {p.name}
                </h3>
              </Link>
              {p.category && (
                <div className="text-[10px] text-text-muted mt-0.5 truncate">
                  {p.category.name}
                </div>
              )}

              {p.firstVariant && (
                <div className="mt-2 mb-3">
                  <Price
                    amountBDT={p.firstVariant.salePrice ?? p.firstVariant.price}
                    className="text-sm font-bold text-text-primary"
                  />
                </div>
              )}

              <Link
                href={`/products/${p.slug}`}
                className="block w-full text-center bg-gradient-primary text-white text-xs font-semibold py-2 rounded-md transition"
              >
                Buy Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}