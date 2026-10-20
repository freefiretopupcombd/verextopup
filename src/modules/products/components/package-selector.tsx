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
    <div className="lg:bg-bg-card lg:border lg:border-border lg:rounded-xl lg:p-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3.5 px-1 lg:px-0">
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

      {/* Grid — Mobile 2 cols, Desktop 3 cols */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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

          const usdtAmount =
            v.usdtPrice != null && v.usdtPrice > 0
              ? v.usdtPrice
              : finalPrice / usdToBdt;

          // Stock text
          const stockText = outOfStock
            ? "Out of Stock"
            : v.unlimitedStock
              ? "In Stock"
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
              className={`relative flex flex-col rounded-lg border transition-all text-left overflow-hidden ${
                outOfStock
                  ? "border-border bg-bg-secondary/50 opacity-50 cursor-not-allowed"
                  : selected
                    ? "border-[#7C3AED] bg-[#7C3AED]/10 ring-1 ring-[#7C3AED]/30 shadow-sm"
                    : "border-border bg-[#1a1a24] hover:border-[#7C3AED]/50"
              }`}
            >
              {/* 📱 Mobile view e selected card er upore bam kone tick mark */}
              {selected && (
                <div className="absolute top-0 left-0 w-5 h-5 bg-[#7C3AED] rounded-br-md flex items-center justify-center z-10 lg:hidden">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}

              {/* ═══ LINE 1: Radio + Name | Price ═══ */}
              <div className={`flex items-center justify-between gap-1.5 px-3 py-2.5 ${selected ? 'pl-7 lg:pl-3' : ''}`}>
                {/* Left: Radio (Desktop only) + Name */}
                <div className="flex items-center gap-2 min-w-0">
                  {/* Desktop view er jonno radio button */}
                  <div
                    className={`hidden lg:flex w-3.5 h-3.5 rounded-full border-2 items-center justify-center shrink-0 transition ${
                      selected
                        ? "border-[#7C3AED] bg-[#7C3AED]"
                        : "border-text-dim"
                    }`}
                  >
                    {selected && (
                      <Check className="w-2 h-2 text-white" strokeWidth={4} />
                    )}
                  </div>
                  
                  <span
                    className={`text-[13px] font-bold truncate ${
                      selected ? "text-[#7C3AED]" : "text-text-primary"
                    }`}
                  >
                    {v.name}
                  </span>
                </div>

                {/* Right: BDT price */}
                <div
                  className={`text-[13px] font-bold shrink-0 ${
                    selected ? "text-[#7C3AED]" : "text-[#F59E0B]"
                  }`}
                >
                  ৳{finalPrice.toFixed(1)}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/40 w-full" />

              {/* ═══ LINE 2: Stock | USDT Price ═══ */}
              <div className={`flex items-center justify-between gap-1.5 px-3 py-2 ${selected ? 'pl-7 lg:pl-3' : ''}`}>
                {/* Left: stock */}
                <div
                  className={`flex items-center gap-1.5 text-[10px] font-medium ${stockColor}`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${stockDot} shrink-0`}
                  />
                  <span className="truncate">{stockText}</span>
                </div>

                {/* Right: USDT */}
                <div className="text-[10px] text-text-muted font-medium shrink-0">
                  = ${usdtAmount.toFixed(2)} USDT
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}