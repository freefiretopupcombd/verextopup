"use client";

import { Check, Zap } from "lucide-react";
import { useCurrency } from "@/modules/currency/context";

type Variant = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  usdtPrice?: number | null;
  stock: number | null;
  unlimitedStock: boolean;
  icon: string | null;
};

export function PackageSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: Variant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { usdToBdt } = useCurrency();

  return (
    <div className="bg-bg-card border border-border rounded-xl p-3.5 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
          1
        </div>
        <h2 className="font-bold text-text-primary text-sm sm:text-base">
          Select Recharge
        </h2>
        <span className="text-xs text-text-muted ml-auto">
          {variants.length} options
        </span>
      </div>

      {/* Grid — 2 cols mobile, 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {variants.map((v) => {
          const outOfStock =
            !v.unlimitedStock && v.stock !== null && v.stock <= 0;
          const lowStock =
            !v.unlimitedStock &&
            v.stock !== null &&
            v.stock > 0 &&
            v.stock <= 5;
          const selected = selectedId === v.id;
          const finalPrice = v.salePrice ?? v.price;
          const hasDiscount =
            v.salePrice !== null &&
            v.salePrice !== undefined &&
            v.salePrice > 0 &&
            v.salePrice < v.price;

          const usdtAmount =
            v.usdtPrice != null && v.usdtPrice > 0
              ? v.usdtPrice
              : finalPrice / usdToBdt;

          // Stock text — clean
          const stockText = outOfStock
            ? "Out of Stock"
            : v.unlimitedStock
              ? "Instant Delivery"
              : lowStock
                ? `Only ${v.stock} left`
                : `In Stock (${v.stock})`;

          const stockColor = outOfStock
            ? "text-danger"
            : lowStock
              ? "text-warning"
              : "text-success";

          const stockDot = outOfStock
            ? "bg-danger"
            : lowStock
              ? "bg-warning"
              : "bg-success";

          return (
            <button
              key={v.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onSelect(v.id)}
              className={`relative flex flex-col rounded-lg border transition text-left overflow-hidden ${
                outOfStock
                  ? "border-border bg-bg-secondary/50 opacity-50 cursor-not-allowed"
                  : selected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30 shadow-sm"
                    : "border-border bg-bg-card hover:border-primary/50 hover:bg-bg-secondary/30"
              }`}
            >
              {/* Discount badge */}
              {hasDiscount && !outOfStock && (
                <span className="absolute top-1 right-1 z-10 text-[9px] font-bold text-success bg-success/20 px-1.5 py-0.5 rounded">
                  -{Math.round(((v.price - finalPrice) / v.price) * 100)}%
                </span>
              )}

              {/* ═══ Main row ═══ */}
              <div className="flex items-center gap-2.5 px-2.5 sm:px-3 py-2.5 sm:py-3">
                {/* Radio */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    selected
                      ? "border-primary bg-primary"
                      : "border-text-dim"
                  }`}
                >
                  {selected && (
                    <Check
                      className="w-2.5 h-2.5 text-white"
                      strokeWidth={4}
                    />
                  )}
                </div>

                {/* Icon + Name */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {v.icon ? (
                    <span className="text-base sm:text-lg leading-none shrink-0">
                      {v.icon}
                    </span>
                  ) : (
                    <span className="text-base sm:text-lg leading-none shrink-0">
                      💎
                    </span>
                  )}
                  <span
                    className={`text-[12px] sm:text-[13px] font-bold truncate ${
                      selected ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    {v.name}
                  </span>
                </div>

                {/* Price — right aligned */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-[13px] sm:text-sm font-bold leading-tight ${
                      selected ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    ৳{finalPrice.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-text-muted leading-tight">
                    ${usdtAmount.toFixed(2)}
                  </div>
                  {hasDiscount && (
                    <div className="text-[9px] text-text-dim line-through leading-tight">
                      ৳{v.price.toFixed(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ Sub row — Stock ═══ */}
              <div
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border-t border-border/40 ${
                  selected ? "bg-primary/5" : "bg-bg-secondary/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${stockDot} shrink-0 ${
                    !outOfStock && !lowStock ? "animate-pulse" : ""
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-[11px] font-medium ${stockColor}`}
                >
                  {stockText}
                </span>
                {v.unlimitedStock && !outOfStock && (
                  <Zap
                    className="w-3 h-3 text-success ml-auto shrink-0"
                    fill="currentColor"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}