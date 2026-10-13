"use client";

import { Check } from "lucide-react";

export type PaymentMethod = {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo: string | null;
  instructions: string | null;
};

// Category: local or crypto (dynamic based on slug)
export function getCategory(slug: string): "local" | "crypto" {
  const cryptoKeywords = [
    "usdt",
    "usdc",
    "binance",
    "btc",
    "eth",
    "crypto",
    "bitcoin",
    "ethereum",
  ];
  const lower = slug.toLowerCase();
  if (cryptoKeywords.some((k) => lower.includes(k))) return "crypto";
  return "local";
}

// Brand color from slug (fallback to primary)
function getBrandStyle(slug: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    bkash: { bg: "bg-[#E2136E]", text: "text-white" },
    nagad: { bg: "bg-[#EC1C24]", text: "text-white" },
    rocket: { bg: "bg-[#8C3494]", text: "text-white" },
    upay: { bg: "bg-[#EE2A7B]", text: "text-white" },
    "binance-pay": { bg: "bg-[#F3BA2F]", text: "text-black" },
    binance: { bg: "bg-[#F3BA2F]", text: "text-black" },
    "usdt-trc20": { bg: "bg-[#26A17B]", text: "text-white" },
    "usdt-erc20": { bg: "bg-[#26A17B]", text: "text-white" },
    "usdt-bep20": { bg: "bg-[#26A17B]", text: "text-white" },
    usdt: { bg: "bg-[#26A17B]", text: "text-white" },
  };
  return map[slug.toLowerCase()] || { bg: "bg-primary", text: "text-white" };
}

function getShortLabel(slug: string, name: string): string {
  const map: Record<string, string> = {
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
    upay: "upay",
    "binance-pay": "BNB",
    binance: "BNB",
    "usdt-trc20": "USDT",
    "usdt-erc20": "USDT",
    "usdt-bep20": "USDT",
    usdt: "USDT",
  };
  return map[slug.toLowerCase()] || name.slice(0, 5).toUpperCase();
}

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  const style = getBrandStyle(method.slug);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition text-left ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-bg-card hover:border-border-light"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-md ${style.bg} ${style.text} flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden`}
      >
        {method.logo ? (
          <img
            src={method.logo}
            alt={method.name}
            className="w-full h-full object-contain"
          />
        ) : (
          getShortLabel(method.slug, method.name)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary text-sm truncate">
          {method.name}
        </div>
        <div className="text-[10px] text-text-muted">Instant</div>
      </div>

      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
          selected ? "border-primary bg-primary" : "border-border"
        }`}
      >
        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}