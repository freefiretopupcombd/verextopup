"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

import { useCurrency } from "../context";

const CURRENCIES = [
  { code: "BDT", symbol: "৳", label: "Bangladeshi Taka" },
  { code: "USDT", symbol: "$", label: "Tether (USDT)" },
] as const;

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div ref={ref} className="relative">
      {/* Compact toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-card border border-border hover:border-primary/40 transition"
        aria-label="Change currency"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-primary">
          {current.symbol}
        </span>
        <span className="text-xs font-semibold text-text-primary">
          {current.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[70]">
          <div className="p-1.5">
            {CURRENCIES.map((c) => {
              const active = c.code === currency;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-text-primary hover:bg-bg-secondary"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      active
                        ? "bg-primary text-white"
                        : "bg-bg-secondary text-text-primary"
                    }`}
                  >
                    {c.symbol}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{c.code}</div>
                    <div className="text-[10px] text-text-muted">
                      {c.label}
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}