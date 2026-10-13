"use client";

import { useCurrency } from "../context";
import {
  convertFromBDT,
  formatPrice,
  type CurrencyCode,
} from "@/lib/currency";

export function Price({
  amountBDT,
  className = "",
  showBoth = false,
}: {
  amountBDT: number;
  className?: string;
  showBoth?: boolean;
}) {
  const { currency, usdToBdt } = useCurrency();

  const converted = convertFromBDT(amountBDT, currency, usdToBdt);
  const formatted = formatPrice(converted, currency);

  if (showBoth && currency !== "BDT") {
    return (
      <span className={className}>
        {formatted}{" "}
        <span className="text-xs text-content-muted">
          (৳{Number(amountBDT).toFixed(2)})
        </span>
      </span>
    );
  }

  return <span className={className}>{formatted}</span>;
}