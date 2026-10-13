"use client";

import { Star, Zap, ShieldCheck, BadgeCheck, Tag } from "lucide-react";

import { displayPrice } from "@/lib/currency";

export function ProductInfo({
  name,
  categoryName,
  rating,
  reviewCount,
  price,
  salePrice,
  currency,
  usdToBdt,
}: {
  name: string;
  categoryName?: string | null;
  rating: number;
  reviewCount: number;
  price: number;
  salePrice: number | null;
  currency: "BDT" | "USDT";
  usdToBdt: number;
}) {
  const finalPrice = salePrice ?? price;
  const priceDisplay = displayPrice(finalPrice, currency, usdToBdt);
  const hasDiscount = salePrice && salePrice < price;

  return (
    <div className="space-y-3">
      {/* Category */}
      {categoryName && (
        <div className="text-xs text-text-muted font-medium">
          {categoryName}
        </div>
      )}

      {/* Title */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary leading-tight">
        {name}
      </h1>

      {/* Rating */}
      {rating > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i <= Math.round(rating)
                    ? "text-warning fill-warning"
                    : "text-text-dim"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-text-primary font-medium">
            {rating.toFixed(1)}
          </span>
          <span className="text-sm text-text-muted">
            ({reviewCount.toLocaleString()} reviews)
          </span>
        </div>
      )}

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge icon={Zap} label="Instant Delivery" color="primary" />
        <Badge icon={BadgeCheck} label="Official Top Up" color="secondary" />
        <Badge icon={ShieldCheck} label="100% Safe" color="success" />
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
          {priceDisplay}
        </span>
        {hasDiscount && (
          <span className="text-lg text-text-muted line-through">
            {displayPrice(price, currency, usdToBdt)}
          </span>
        )}
      </div>

      {/* Lowest price badge */}
      <div className="inline-flex items-center gap-1.5 text-xs text-success font-medium">
        <Tag className="w-3.5 h-3.5" />
        <span>Lowest price in the market</span>
      </div>
    </div>
  );
}

function Badge({
  icon: Icon,
  label,
  color,
}: {
  icon: any;
  label: string;
  color: "primary" | "secondary" | "success";
}) {
  const styles = {
    primary: "bg-primary/15 text-primary border-primary/30",
    secondary: "bg-secondary/15 text-secondary-light border-secondary/30",
    success: "bg-success/15 text-success border-success/30",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${styles[color]}`}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}