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
  sortOrder?: number; // 👈 sortOrder টাইপে অ্যাড করা হলো
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

  // 👇 ১. ভ্যারিয়েশনগুলোকে sortOrder অনুযায়ী সাজানোর লজিক
  const sortedVariants = [...variants].sort((a, b) => {
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    return orderA - orderB;
  });

  return (
    <div className="bg-bg-card border border-border rounded-xl p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 px-1 sm:px-0">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
          1
        </div>
        <h2 className="font-bold text-text-primary text-sm sm:text-base">
          Select Recharge
        </h2>
        <span className="text-xs text-text-muted ml-auto">
          {sortedVariants.length} options
        </span>
      </div>

      {/* Grid — Mobile 2 cols, Desktop 3 cols */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {/* 👇 ২. variants এর জায়গায় sortedVariants ম্যাপ করা হলো */}
        {sortedVariants.map((v) => {
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

          // ✅ BDT এর শেষে .0 থাকলে তা রিমুভ করার লজিক
          const formattedPrice = finalPrice % 1 === 0 
            ? finalPrice.toString() 
            : finalPrice.toFixed(2).replace(/\.?0+$/, '');

          // Stock text
          const stockText = outOfStock
            ? "Out of Stock"
            : v.unlimitedStock
              ? "In Stock"
              : lowStock
                ? `Only ${v.stock} left`
                : `In Stock`;

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
              className={`relative flex flex-col rounded-lg sm:rounded-xl border transition-all text-left overflow-hidden ${
                outOfStock
                  ? "border-border bg-bg-secondary/50 opacity-50 cursor-not-allowed"
                  : selected
                    ? "border-[#7C3AED] bg-[#7C3AED]/10 ring-1 ring-[#7C3AED]/30 shadow-sm"
                    : "border-border bg-[#1a1a24] hover:border-[#7C3AED]/50"
              }`}
            >
              {selected && (
                <div className="absolute top-0 left-0 w-4 h-4 sm:w-5 sm:h-5 bg-[#7C3AED] rounded-br-md flex items-center justify-center z-10 lg:hidden">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                </div>
              )}

              {/* ═══ LINE 1: Radio + Name | Price ═══ */}
              <div className={`flex items-center justify-between gap-1 px-2 sm:px-3 py-1.5 sm:py-2.5 ${selected ? 'pl-6 sm:pl-7 lg:pl-3' : ''}`}>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
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
                    className={`text-[11px] sm:text-[13px] font-bold truncate ${
                      selected ? "text-[#7C3AED]" : "text-text-primary"
                    }`}
                  >
                    {v.name}
                  </span>
                </div>

                <div
                  className={`text-[11px] sm:text-[13px] font-bold shrink-0 ${
                    selected ? "text-[#7C3AED]" : "text-[#F59E0B]"
                  }`}
                >
                  ৳{formattedPrice}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/40 w-full" />

              {/* ═══ LINE 2: Stock | USDT Price ═══ */}
              <div className={`flex items-center justify-between gap-1 px-2 sm:px-3 py-1 sm:py-2 ${selected ? 'pl-6 sm:pl-7 lg:pl-3' : ''}`}>
                <div
                  className={`flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-medium ${stockColor}`}
                >
                  <span
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${stockDot} shrink-0`}
                  />
                  <span className="truncate">{stockText}</span>
                </div>

                <div className="text-[9px] sm:text-[10px] text-text-muted font-medium shrink-0">
                  = ${usdtAmount.toFixed(2)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}