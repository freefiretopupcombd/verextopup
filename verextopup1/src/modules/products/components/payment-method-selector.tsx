"use client";

import { Wallet, Zap, Lock, Check, ChevronDown } from "lucide-react";
import { useState } from "react";


export type PaymentChoice = "WALLET" | "INSTANT";

export type AvailableMethod = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  accountNumber: string | null;
};

export function PaymentMethodSelector({
  selected,
  onSelect,
  selectedMethodId,
  onMethodSelect,
  walletBalance,
  totalAmount,
  isLoggedIn,
  availableMethods,
}: {
  selected: PaymentChoice;
  onSelect: (choice: PaymentChoice) => void;
  selectedMethodId: string | null;
  onMethodSelect: (methodId: string) => void;
  walletBalance: number;
  totalAmount: number;
  isLoggedIn: boolean;
  availableMethods: AvailableMethod[];
}) {
  const [expanded, setExpanded] = useState(false);

  const hasEnoughBalance = walletBalance >= totalAmount;
  const walletDisabled = !isLoggedIn || !hasEnoughBalance;

  const handleInstantSelect = () => {
    onSelect("INSTANT");
    setExpanded(true);
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
          3
        </div>
        <h2 className="font-bold text-text-primary text-base sm:text-lg">
          Select one option
        </h2>
      </div>

      <div className="space-y-3">
        {/* ============================================
            WALLET PAYMENT
        ============================================ */}
        <button
          type="button"
          onClick={() => !walletDisabled && onSelect("WALLET")}
          disabled={walletDisabled}
          className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition text-left ${
            walletDisabled
              ? "border-border bg-bg-secondary/30 opacity-60 cursor-not-allowed"
              : selected === "WALLET"
                ? "border-primary bg-primary/10"
                : "border-border bg-bg-card hover:border-border-light"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
              selected === "WALLET" && !walletDisabled
                ? "border-primary"
                : "border-text-dim"
            }`}
          >
            {selected === "WALLET" && !walletDisabled && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-text-primary text-sm">
                Wallet Payment
              </span>
            </div>

            <p className="text-xs text-text-muted mt-1">
              আপনার account balance থেকে pay করুন
            </p>

            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-text-muted">Balance:</span>
              <span className="font-semibold text-text-primary">
                ৳{walletBalance.toFixed(2)}
              </span>
            </div>

            {!isLoggedIn && (
              <p className="text-[10px] text-warning mt-1">
                ⚠️ Login করতে হবে
              </p>
            )}

            {isLoggedIn && !hasEnoughBalance && (
              <p className="text-[10px] text-danger mt-1">
                ❌ Balance কম আছে (প্রয়োজন: ৳{totalAmount.toFixed(2)})
              </p>
            )}
          </div>
        </button>

        {/* ============================================
            INSTANT PAYMENT (expandable)
        ============================================ */}
        <div
          className={`rounded-lg border-2 transition ${
            selected === "INSTANT"
              ? "border-primary bg-primary/10"
              : "border-border bg-bg-card"
          }`}
        >
          <button
            type="button"
            onClick={handleInstantSelect}
            className="w-full flex items-start gap-3 p-4 text-left"
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                selected === "INSTANT" ? "border-primary" : "border-text-dim"
              }`}
            >
              {selected === "INSTANT" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning shrink-0" />
                <span className="font-semibold text-text-primary text-sm">
                  Instant Payment
                </span>
              </div>

              <p className="text-xs text-text-muted mt-1">
                {availableMethods.length} টা method available
              </p>

              {/* Selected method indicator */}
              {selected === "INSTANT" && selectedMethodId && (
                <div className="mt-2 text-xs text-primary font-medium">
                  ✓{" "}
                  {availableMethods.find((m) => m.id === selectedMethodId)
                    ?.name || "Method selected"}
                </div>
              )}
            </div>

            <ChevronDown
              className={`w-4 h-4 text-text-muted shrink-0 mt-0.5 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* ============================================
              METHODS LIST (expanded)
          ============================================ */}
          {expanded && (
            <div className="px-3 pb-3 space-y-2 border-t border-border pt-3">
              {availableMethods.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-3">
                  কোনো payment method available নেই।
                </p>
              ) : (
                availableMethods.map((method) => {
                  const isSelected = selectedMethodId === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        onSelect("INSTANT");
                        onMethodSelect(method.id);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition text-left ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-bg-secondary hover:border-border-light"
                      }`}
                    >
                      {/* Radio */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-text-dim"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        )}
                      </div>

                      {/* Logo / Initial */}
                      <div className="w-9 h-9 rounded-md bg-bg-card border border-border flex items-center justify-center shrink-0 overflow-hidden font-bold text-[10px] text-text-primary">
                        {method.logo ? (
                          <img
                            src={method.logo}
                            alt={method.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          method.slug.slice(0, 4).toUpperCase()
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium truncate ${
                            isSelected ? "text-primary" : "text-text-primary"
                          }`}
                        >
                          {method.name}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          Manual payment
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security note */}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-[10px] text-text-muted">
        <Lock className="w-3 h-3" />
        <span>100% secure payment guaranteed</span>
      </div>
    </div>
  );
}