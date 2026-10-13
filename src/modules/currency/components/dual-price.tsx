"use client";

import { convertFromBDT, formatPrice } from "@/lib/currency";
import { useCurrency } from "../context";

export function DualPrice({
  amountBDT,
  size = "md",
  layout = "stacked",
  className = "",
  primaryClassName = "",
  secondaryClassName = "",
}: {
  amountBDT: number;
  /** sm = small (variation card), md = default, lg = big (total) */
  size?: "sm" | "md" | "lg" | "xl";
  /** stacked = two lines, inline = side by side */
  layout?: "stacked" | "inline";
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}) {
  const { currency, usdToBdt } = useCurrency();

  const bdtAmount = Number(amountBDT) || 0;
  const usdtAmount = convertFromBDT(bdtAmount, "USDT", usdToBdt);

  // Primary = selected currency, Secondary = other
  const primaryText =
    currency === "BDT"
      ? formatPrice(bdtAmount, "BDT")
      : formatPrice(usdtAmount, "USDT");

  const secondaryText =
    currency === "BDT"
      ? formatPrice(usdtAmount, "USDT")
      : formatPrice(bdtAmount, "BDT");

  const sizeMap = {
    sm: {
      primary: "text-xs sm:text-sm font-bold",
      secondary: "text-[9px] sm:text-[10px] font-medium",
    },
    md: {
      primary: "text-sm sm:text-base font-bold",
      secondary: "text-[10px] sm:text-xs font-medium",
    },
    lg: {
      primary: "text-lg sm:text-xl font-bold",
      secondary: "text-xs sm:text-sm font-medium",
    },
    xl: {
      primary: "text-2xl sm:text-3xl font-bold",
      secondary: "text-sm sm:text-base font-medium",
    },
  };

  if (layout === "inline") {
    return (
      <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
        <span className={`${sizeMap[size].primary} ${primaryClassName}`}>
          {primaryText}
        </span>
        <span
          className={`${sizeMap[size].secondary} text-text-muted ${secondaryClassName}`}
        >
          {secondaryText}
        </span>
      </div>
    );
  }

  // Stacked (default)
  return (
    <div className={`flex flex-col items-end ${className}`}>
      <span
        className={`${sizeMap[size].primary} whitespace-nowrap leading-tight ${primaryClassName}`}
      >
        {primaryText}
      </span>
      <span
        className={`${sizeMap[size].secondary} text-text-muted whitespace-nowrap leading-tight mt-0.5 ${secondaryClassName}`}
      >
        {secondaryText}
      </span>
    </div>
  );
}