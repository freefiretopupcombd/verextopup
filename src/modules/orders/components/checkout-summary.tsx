"use client";

import { DualPrice } from "@/modules/currency/components/dual-price";

export function CheckoutSummary({
  productName,
  productThumbnail,
  productIcon,
  variantName,
  variantIcon,
  quantity,
  unitPrice,
  salePrice,
  fields,
}: {
  productName: string;
  productThumbnail: string | null;
  productIcon: string | null;
  variantName: string;
  variantIcon: string | null;
  quantity: number;
  unitPrice: number;
  salePrice: number | null;
  fields: Record<string, string>;
}) {
  const finalUnitPrice = salePrice ?? unitPrice;
  const subtotal = finalUnitPrice * quantity;
  const savings =
    salePrice && salePrice < unitPrice ? (unitPrice - salePrice) * quantity : 0;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
      <h2 className="font-bold text-text-primary text-base">Order Summary</h2>

      {/* Product */}
      <div className="flex gap-3 pb-4 border-b border-border">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/15 to-bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
          {productThumbnail ? (
            <img
              src={productThumbnail}
              alt={productName}
              className="w-full h-full object-cover"
            />
          ) : productIcon ? (
            <span className="text-2xl">{productIcon}</span>
          ) : (
            <span className="text-2xl">🎮</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {productName}
          </div>
          <div className="text-xs text-text-muted truncate mt-0.5">
            {variantIcon && <span className="mr-1">{variantIcon}</span>}
            {variantName}
          </div>
          <div className="text-xs text-text-muted mt-0.5">× {quantity}</div>
        </div>
      </div>

      {/* Account info */}
      {Object.keys(fields).length > 0 && (
        <div className="pb-4 border-b border-border">
          <div className="text-xs font-semibold text-text-secondary mb-2">
            Account Information
          </div>
          <div className="space-y-1.5">
            {Object.entries(fields)
              .filter(([_, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-xs">
                  <span className="text-text-muted capitalize">
                    {k.replace(/_/g, " ")}
                  </span>
                  <span className="text-text-primary font-medium truncate">
                    {v}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Price breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Subtotal</span>
          <DualPrice
            amountBDT={subtotal}
            size="sm"
            layout="stacked"
            primaryClassName="text-text-primary"
          />
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Discount</span>
            <span className="font-medium text-success">
              −৳{savings.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Delivery</span>
          <span className="font-medium text-success">Free</span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-border flex items-baseline justify-between">
        <span className="text-sm text-text-muted">Total</span>
        <DualPrice
          amountBDT={subtotal}
          size="lg"
          layout="stacked"
          primaryClassName="text-primary"
        />
      </div>
    </div>
  );
}