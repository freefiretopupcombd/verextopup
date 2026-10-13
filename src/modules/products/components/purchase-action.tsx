"use client";

import { ShoppingCart, Loader2 } from "lucide-react";

import { DualPrice } from "@/modules/currency/components/dual-price";

export function PurchaseAction({
  totalAmount,
  originalAmount,
  savings,
  submitting,
  disabled,
  onBuy,
}: {
  totalAmount: number;
  originalAmount: number;
  savings: number;
  submitting: boolean;
  disabled: boolean;
  onBuy: () => void;
  paymentChoice?: any;
  hasEnoughWallet?: boolean;
}) {
  return (
    <div className="space-y-3">
      {/* Price breakdown */}
      <div className="bg-bg-card border border-border rounded-xl p-4">
        {savings > 0 && (
          <>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-text-muted">Original</span>
              <DualPrice
                amountBDT={originalAmount}
                size="sm"
                layout="inline"
                primaryClassName="text-text-muted line-through"
                secondaryClassName="hidden"
              />
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-success">Discount</span>
              <span className="text-success font-semibold">
                −৳{savings.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border my-2" />
          </>
        )}

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-text-muted">Total</span>
          <DualPrice
            amountBDT={totalAmount}
            size="lg"
            layout="stacked"
            primaryClassName="text-primary"
          />
        </div>
      </div>

      {/* Buy Now Button */}
      <button
        type="button"
        onClick={onBuy}
        disabled={disabled || submitting}
        className="w-full bg-gradient-primary text-white font-semibold py-3.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Buy Now
          </>
        )}
      </button>
    </div>
  );
}