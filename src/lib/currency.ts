// ==================================================
// Currency Types & Constants
// ==================================================

export const SUPPORTED_CURRENCIES = {
  BDT: {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    nameBn: "বাংলাদেশি টাকা",
    decimals: 2,
  },
  USDT: {
    code: "USDT",
    symbol: "USDT",
    name: "Tether USD",
    nameBn: "টেদার",
    decimals: 2,
  },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export const DEFAULT_CURRENCY: CurrencyCode = "BDT";

// ==================================================
// Currency Formatting
// ==================================================

export function formatPrice(
  amount: number,
  currency: CurrencyCode = "BDT"
): string {
  const meta = SUPPORTED_CURRENCIES[currency];
  const num = Number(amount);

  if (isNaN(num)) return `${meta.symbol} 0.00`;

  // For USDT — symbol space formatting
  if (currency === "USDT") {
    return `${meta.symbol} ${num.toFixed(2)}`;
  }

  // BDT — symbol tight against number
  return `${meta.symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ==================================================
// Currency Conversion
// ==================================================

export function convertFromBDT(
  amountBDT: number,
  targetCurrency: CurrencyCode,
  usdToBdtRate: number
): number {
  const bdt = Number(amountBDT);
  if (isNaN(bdt) || bdt === 0) return 0;
  if (targetCurrency === "BDT") return bdt;

  // USDT ~= USD
  if (targetCurrency === "USDT") {
    if (!usdToBdtRate || usdToBdtRate <= 0) return 0;
    return bdt / usdToBdtRate;
  }

  return bdt;
}

export function convertToBDT(
  amount: number,
  fromCurrency: CurrencyCode,
  usdToBdtRate: number
): number {
  const num = Number(amount);
  if (isNaN(num)) return 0;
  if (fromCurrency === "BDT") return num;

  if (fromCurrency === "USDT") {
    return num * usdToBdtRate;
  }

  return num;
}

export function displayPrice(
  amountBDT: number,
  targetCurrency: CurrencyCode,
  usdToBdtRate: number
): string {
  const converted = convertFromBDT(amountBDT, targetCurrency, usdToBdtRate);
  return formatPrice(converted, targetCurrency);
}

// ==================================================
// Validation
// ==================================================

export function isValidCurrency(code: string): code is CurrencyCode {
  return code === "BDT" || code === "USDT";
}