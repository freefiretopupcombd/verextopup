import Link from "next/link";
import Image from "next/image";
import { PackageOpen, TrendingUp } from "lucide-react";

import { DualPrice } from "@/modules/currency/components/dual-price";
import type { OfferProduct } from "../queries";

export function OfferProductGrid({
  products,
  emptyMessage = "এই category তে এখনো কোনো product নেই",
}: {
  products: OfferProduct[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-2xl p-12 text-center">
        <PackageOpen className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product, index) => (
        <OfferCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}

// ==================================================
// OFFER CARD
// ==================================================
function OfferCard({
  product,
  priority,
}: {
  product: OfferProduct;
  priority: boolean;
}) {
  const price = product.firstVariant
    ? product.firstVariant.salePrice ?? product.firstVariant.price
    : 0;

  const originalPrice = product.firstVariant?.price ?? 0;

  return (
    <div className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-primary/10 via-bg-secondary to-bg-card flex items-center justify-center overflow-hidden relative">
          {/* Discount Badge */}
          {product.discountPercent > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">
              -{product.discountPercent}%
            </div>
          )}

          {/* Special Badges */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            {product.isNew && (
              <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                NEW
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-yellow-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                ★
              </span>
            )}
          </div>

          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
              className="object-cover group-hover:scale-105 transition duration-300"
              priority={priority}
              quality={80}
            />
          ) : product.icon ? (
            <div className="text-5xl sm:text-6xl">{product.icon}</div>
          ) : (
            <div className="text-5xl sm:text-6xl">🎮</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-text-primary truncate hover:text-primary transition">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <div className="text-[11px] text-text-muted mt-0.5 truncate">
            {product.category.name}
          </div>
        )}

        {/* Sold count */}
        {product.soldCount > 10 && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-text-muted">
            <TrendingUp className="w-3 h-3 text-success" />
            {product.soldCount}+ sold
          </div>
        )}

        {/* Price */}
        <div className="mt-2 mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-primary">
              ৳{price.toFixed(0)}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-text-muted line-through">
                ৳{originalPrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="block w-full text-center bg-gradient-primary text-white text-xs font-semibold py-2 rounded-lg transition hover:opacity-90"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}