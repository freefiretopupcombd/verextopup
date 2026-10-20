"use client";

import {
  Wallet,
  Zap,
  CreditCard,
  Check,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useState } from "react";

type PaymentChoice = "WALLET" | "INSTANT" | "UDDOKTAPAY";

type PaymentMethod = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

// ==================================================
// PAYMENT METHOD CARDS — Step 3
// ==================================================
export function PaymentMethodCards({
  isLoggedIn,
  walletBalance,
  totalAmount,
  hasEnoughWallet,
  paymentMethods,
  uddoktaPayEnabled,
  selected,
  onSelect,
  selectedMethodId,
  onMethodSelect,
}: {
  isLoggedIn: boolean;
  walletBalance: number;
  totalAmount: number;
  hasEnoughWallet: boolean;
  paymentMethods: PaymentMethod[];
  uddoktaPayEnabled: boolean;
  selected: PaymentChoice;
  onSelect: (choice: PaymentChoice) => void;
  selectedMethodId: string | null;
  onMethodSelect: (id: string) => void;
}) {
  const [methodsExpanded, setMethodsExpanded] = useState(false);

  const hasWalletOption = isLoggedIn;
  const hasInstantOption = uddoktaPayEnabled;
  const hasManualOption = paymentMethods.length > 0;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-3.5 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
          3
        </div>
        <h2 className="font-bold text-text-primary text-sm sm:text-base">
          Select Payment
        </h2>
      </div>

      <div className="space-y-2">
        {/* Wallet */}
        {hasWalletOption && (
          <PaymentCard
            icon={Wallet}
            iconGradient="from-violet-500 to-purple-600"
            title="Wallet Payment"
            subtitle={`Balance: ৳${walletBalance.toFixed(2)}`}
            selected={selected === "WALLET"}
            disabled={!hasEnoughWallet}
            onClick={() => hasEnoughWallet && onSelect("WALLET")}
            warning={
              !hasEnoughWallet
                ? `প্রয়োজন ৳${totalAmount.toFixed(2)}`
                : null
            }
          />
        )}

        {/* UddoktaPay */}
        {hasInstantOption && (
          <PaymentCard
            icon={Zap}
            iconGradient="from-amber-500 to-orange-500"
            title="Pay Instantly"
            subtitle="bKash, Nagad, Rocket, Card"
            selected={selected === "UDDOKTAPAY"}
            recommended
            onClick={() => onSelect("UDDOKTAPAY")}
            features={["100% Secure", "Auto Delivery"]}
          />
        )}

        {/* Manual */}
        {hasManualOption && (
          <div
            className={`rounded-lg border overflow-hidden transition-all ${
              selected === "INSTANT"
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border bg-bg-card hover:border-primary/40"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelect("INSTANT");
                setMethodsExpanded(true);
              }}
              className="w-full flex items-center gap-2.5 p-3 text-left"
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition ${
                  selected === "INSTANT"
                    ? "border-primary bg-primary"
                    : "border-text-dim"
                }`}
              >
                {selected === "INSTANT" && (
                  <Check className="w-2 h-2 text-white" strokeWidth={4} />
                )}
              </div>

              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-md">
                <CreditCard className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-text-primary">
                  Manual Payment
                </div>
                <div className="text-[10px] sm:text-xs text-text-muted">
                  {paymentMethods.length} methods available
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${
                  methodsExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {methodsExpanded && selected === "INSTANT" && (
              <div className="px-3 pb-3 space-y-1.5 border-t border-border pt-2.5">
                {paymentMethods.map((method) => {
                  const isSel = selectedMethodId === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => onMethodSelect(method.id)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg border transition text-left ${
                        isSel
                          ? "border-primary bg-primary/10"
                          : "border-border bg-bg-secondary hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSel
                            ? "border-primary bg-primary"
                            : "border-text-dim"
                        }`}
                      >
                        {isSel && (
                          <Check
                            className="w-2 h-2 text-white"
                            strokeWidth={4}
                          />
                        )}
                      </div>

                      <div className="w-7 h-7 rounded-md bg-bg-card border border-border flex items-center justify-center shrink-0 overflow-hidden font-bold text-[9px] text-text-primary">
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

                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-medium truncate ${
                            isSel ? "text-primary" : "text-text-primary"
                          }`}
                        >
                          {method.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty */}
        {!hasWalletOption &&
          !hasInstantOption &&
          !hasManualOption && (
            <p className="text-xs text-text-muted text-center py-4">
              কোনো payment method available নেই
            </p>
          )}
      </div>

      {/* Security footer */}
      <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-[10px] text-text-muted">
        <Shield className="w-3 h-3 text-success" />
        <span>100% secure payment guaranteed</span>
      </div>
    </div>
  );
}

// ==================================================
// PAYMENT CARD
// ==================================================
function PaymentCard({
  icon: Icon,
  iconGradient,
  title,
  subtitle,
  selected,
  disabled,
  recommended,
  onClick,
  warning,
  features,
}: {
  icon: any;
  iconGradient: string;
  title: string;
  subtitle: string;
  selected: boolean;
  disabled?: boolean;
  recommended?: boolean;
  onClick: () => void;
  warning?: string | null;
  features?: string[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full flex items-center gap-2.5 p-3 rounded-lg border transition-all text-left overflow-hidden ${
        disabled
          ? "border-border bg-bg-secondary/40 opacity-60 cursor-not-allowed"
          : selected
            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
            : "border-border bg-bg-card hover:border-primary/40"
      }`}
    >
      {recommended && !disabled && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary-light text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg tracking-wider">
          RECOMMENDED
        </div>
      )}

      <div
        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition ${
          selected ? "border-primary bg-primary" : "border-text-dim"
        }`}
      >
        {selected && (
          <Check className="w-2 h-2 text-white" strokeWidth={4} />
        )}
      </div>

      <div
        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${iconGradient} flex items-center justify-center shrink-0 shadow-md`}
      >
        <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs sm:text-sm font-bold ${
              selected ? "text-primary" : "text-text-primary"
            }`}
          >
            {title}
          </span>
        </div>

        <div className="text-[10px] sm:text-xs text-text-muted mt-0.5">
          {subtitle}
        </div>

        {features && features.length > 0 && (
          <div className="flex items-center gap-2.5 mt-1">
            {features.map((f) => (
              <span
                key={f}
                className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-success font-medium"
              >
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                {f}
              </span>
            ))}
          </div>
        )}

        {warning && (
          <div className="text-[10px] text-danger mt-1 font-medium">
            {warning}
          </div>
        )}
      </div>
    </button>
  );
}