"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { DualPrice } from "@/modules/currency/components/dual-price";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  imageAlt?: string | null; // ✅ নতুন ফিল্ড
  icon: string | null;
  productType: string;
  category: { name: string; slug: string } | null;
  firstVariant: {
    name: string;
    price: number;
    salePrice: number | null;
  } | null;
  variantCount: number;
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const price = product.firstVariant
    ? (product.firstVariant.salePrice ?? product.firstVariant.price)
    : 0;
  const hasDiscount =
    product.firstVariant?.salePrice &&
    product.firstVariant.salePrice < product.firstVariant.price;

  return (
    <div className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-primary/10 via-bg-secondary to-bg-card flex items-center justify-center overflow-hidden relative">
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 bg-bg-primary/80 backdrop-blur border border-border text-[10px] font-medium text-text-secondary px-2 py-1 rounded">
              <BadgeCheck className="w-2.5 h-2.5 text-primary" />
              {formatType(product.productType)}
            </span>
          </div>

          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.imageAlt || product.name} // ✅ Alt Text
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

        {/* Dual Price */}
        <div className="mt-2 mb-3">
          <DualPrice
            amountBDT={price}
            size="md"
            layout="stacked"
            className="!items-start"
            primaryClassName="text-text-primary"
          />
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="block w-full text-center bg-gradient-primary text-white text-xs font-semibold py-2 rounded-lg transition"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}

export function formatType(type: string): string {
  const map: Record<string, string> = {
    TOPUP: "Top Up",
    GIFT_CARD: "Gift Card",
    SUBSCRIPTION: "Subscription",
    SERVICE: "Service",
  };
  return map[type] || type;
}