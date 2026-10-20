"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode = "BDT" | "USDT";

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  usdToBdt: number;
  setUsdToBdt: (n: number) => void;
  toggleCurrency: () => void;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_KEY = "verextopup.currency";

export function CurrencyProvider({
  children,
  initialCurrency = "BDT",
  usdToBdt = 127,
}: {
  children: React.ReactNode;
  initialCurrency?: CurrencyCode;
  usdToBdt?: number;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);
  const [rate, setRate] = useState(usdToBdt);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "BDT" || stored === "USDT") {
        setCurrencyState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync rate if prop changes
  useEffect(() => {
    setRate(usdToBdt);
  }, [usdToBdt]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === "BDT" ? "USDT" : "BDT");
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        usdToBdt: rate,
        setUsdToBdt: setRate,
        toggleCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used inside CurrencyProvider");
  }
  return ctx;
}