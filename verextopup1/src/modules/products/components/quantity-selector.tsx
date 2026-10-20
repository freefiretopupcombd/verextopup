"use client";

import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  quantity,
  onQuantityChange,
  maxQuantity,
  isUnlimited,
  stockCount,
}: {
  quantity: number;
  onQuantityChange: (q: number) => void;
  maxQuantity: number;
  isUnlimited: boolean;
  stockCount: number | null;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
      <div>
        <h3 className="font-bold text-text-primary text-sm">Quantity</h3>
        {!isUnlimited && stockCount !== null && (
          <p
            className={`text-[10px] mt-0.5 ${
              stockCount <= 5 ? "text-warning" : "text-text-muted"
            }`}
          >
            {stockCount <= 5
              ? `মাত্র ${stockCount} টা বাকি`
              : `${stockCount} available`}
          </p>
        )}
      </div>

      <div className="inline-flex items-center border border-border rounded-lg overflow-hidden bg-bg-secondary">
        <button
          type="button"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="px-2.5 py-1.5 text-text-primary hover:bg-bg-card transition disabled:opacity-40"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="px-4 py-1.5 text-sm font-bold text-text-primary border-x border-border min-w-[48px] text-center">
          {quantity}
        </div>
        <button
          type="button"
          onClick={() =>
            onQuantityChange(Math.min(maxQuantity, quantity + 1))
          }
          disabled={quantity >= maxQuantity}
          className="px-2.5 py-1.5 text-text-primary hover:bg-bg-card transition disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}