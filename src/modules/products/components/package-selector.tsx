"use client";

import { Check } from "lucide-react";
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
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

          // Stock text
          const stockText = outOfStock
            ? "Out of Stock"
            : v.unlimitedStock
              ? "Unlimited"
              : lowStock
                ? `Only ${v.stock}`
                : `${v.stock} in Stock`;

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
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-bg-card hover:border-primary/50"
              }`}
            >
              {/* Discount badge */}
              {hasDiscount && !outOfStock && (
                <span className="absolute top-1 right-1 z-10 text-[8px] sm:text-[9px] font-bold text-success bg-success/15 px-1 sm:px-1.5 py-0.5 rounded">
                  -{Math.round(((v.price - finalPrice) / v.price) * 100)}%
                </span>
              )}

              {/* ═══ LINE 1: Radio + Name | Icon ═══ */}
              <div className="flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5">
                {/* Left: radio + name */}
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <div
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      selected
                        ? "border-primary bg-primary"
                        : "border-text-dim"
                    }`}
                  >
                    {selected && (
                      <Check
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
                        strokeWidth={4}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[11px] sm:text-[13px] font-semibold truncate ${
                      selected ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    {v.name}
                  </span>
                </div>

                {/* Right: icon */}
                {v.icon && (
                  <span className="text-sm sm:text-base leading-none shrink-0">
                    {v.icon}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-border/60" />

              {/* ═══ LINE 2: Stock | Price + USDT ═══ */}
              <div className="flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2">
                {/* Left: stock */}
                <div
                  className={`flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-medium min-w-0 ${stockColor}`}
                >
                  <span
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${stockDot} shrink-0`}
                  />
                  <span className="truncate">{stockText}</span>
                </div>

                {/* Right: BDT + USDT */}
                <div className="flex items-baseline gap-1 shrink-0">
                  <span
                    className={`text-[11px] sm:text-[13px] font-bold leading-none ${
                      selected ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    ৳{finalPrice.toFixed(0)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-text-muted leading-none">
                    (${usdtAmount.toFixed(2)})
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}