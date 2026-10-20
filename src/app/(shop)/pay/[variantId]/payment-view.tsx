"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { DualPrice } from "@/modules/currency/components/dual-price";
import { createOrderFromProductAction } from "@/modules/orders/actions";

type PaymentMethod = {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo: string | null;
  instructions: string | null;
  accountNumber: string | null;
  merchantNumber: string | null;
  inputFields: any[];
};

export function PaymentView({
  variant,
  product,
  quantity,
  totalAmount,
  paymentType,
  paymentMethod,
  walletBalance,
  productFieldValues,
}: {
  variant: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    icon: string | null;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    icon: string | null;
    categoryName: string | null;
  };
  quantity: number;
  totalAmount: number;
  paymentType: "wallet" | "instant";
  paymentMethod: PaymentMethod | null;
  walletBalance: number;
  productFieldValues: Record<string, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [paymentFieldValues, setPaymentFieldValues] = useState<
    Record<string, string>
  >({});
  const [paymentFieldErrors, setPaymentFieldErrors] = useState<
    Record<string, string>
  >({});
  const [confirmed, setConfirmed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const methodFields: any[] = Array.isArray(paymentMethod?.inputFields)
    ? [...paymentMethod.inputFields].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      )
    : [];

  const handlePaymentFieldChange = (name: string, value: string) => {
    setPaymentFieldValues((prev) => ({ ...prev, [name]: value }));
    if (paymentFieldErrors[name]) {
      setPaymentFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validatePayment = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of methodFields) {
      const val = paymentFieldValues[field.name] || "";
      if (field.required && !val.trim()) {
        errors[field.name] = `${field.label} দিতে হবে`;
      }
    }
    setPaymentFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = () => {
    // Validation
    if (paymentType === "instant") {
      if (!paymentMethod) {
        toast.error("Payment method পাওয়া যায়নি");
        return;
      }
      if (!validatePayment()) {
        toast.error("সব required field পূরণ করুন");
        return;
      }
      if (!confirmed) {
        toast.error("Payment সম্পন্ন করার confirmation দিন");
        return;
      }
    }

    if (paymentType === "wallet" && walletBalance < totalAmount) {
      toast.error("Wallet-এ যথেষ্ট balance নেই");
      return;
    }

    const formData = new FormData();
    formData.set("variantId", variant.id);
    formData.set("quantity", String(quantity));
    formData.set("paymentType", paymentType);
    formData.set("paymentMethodId", paymentMethod?.id || "");
    formData.set("fields", JSON.stringify(productFieldValues));
    formData.set(
      "paymentFields",
      JSON.stringify(paymentType === "instant" ? paymentFieldValues : {})
    );

    startTransition(async () => {
      const result = await createOrderFromProductAction(formData);

      if (result.success && result.orderNumber) {
        toast.success(result.message || "Order তৈরি হয়েছে!");
        router.push(`/order/${result.orderNumber}`);
      } else {
        toast.error(result.message || "Order create failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          Complete Your Payment
        </h1>
        
      </div>

      {/* Product Summary */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
        <div className="flex gap-3 items-center">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : product.icon ? (
              <span className="text-3xl">{product.icon}</span>
            ) : (
              <span className="text-3xl">🎮</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {product.categoryName && (
              <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {product.categoryName}
              </div>
            )}
            <h2 className="font-bold text-text-primary text-sm sm:text-base truncate">
              {product.name}
            </h2>
            <div className="text-xs text-text-muted mt-0.5">
              {variant.icon && <span className="mr-1">{variant.icon}</span>}
              {variant.name} × {quantity}
            </div>
          </div>

          <div className="text-right shrink-0">
            <DualPrice
              amountBDT={totalAmount}
              size="md"
              layout="stacked"
              primaryClassName="text-primary"
            />
          </div>
        </div>

        {/* Product fields (Player ID etc.) */}
        {Object.entries(productFieldValues).filter(([_, v]) => v).length > 0 && (
          <div className="mt-3 pt-3 border-t border-border space-y-1.5">
            {Object.entries(productFieldValues)
              .filter(([_, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-text-muted capitalize">
                    {k.replace(/_/g, " ")}
                  </span>
                  <span className="text-text-primary font-mono">{v}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ============================================
          WALLET PAYMENT
      ============================================ */}
      {paymentType === "wallet" && (
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text-primary text-base">
              Wallet Payment
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Your Balance</span>
              <span className="font-mono text-text-primary">
                ৳{walletBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total</span>
              <span className="font-mono text-text-primary">
                ৳{totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-border">
              <span className="text-text-muted">After Payment</span>
              <span
                className={`font-mono font-semibold ${
                  walletBalance - totalAmount >= 0
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                ৳{(walletBalance - totalAmount).toFixed(2)}
              </span>
            </div>

            {walletBalance < totalAmount && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <p className="text-xs text-danger">
                  Wallet-এ যথেষ্ট balance নেই। Recharge করুন অথবা অন্য
                  payment method select করুন।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================
          INSTANT PAYMENT
      ============================================ */}
      {paymentType === "instant" && paymentMethod && (
        <>
          {/* Payment Instructions */}
          <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-warning" />
              <h2 className="font-bold text-text-primary text-base">
                Payment Instructions
              </h2>
            </div>

            <div className="space-y-4">
              {/* Method */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-bg-card border border-border flex items-center justify-center shrink-0 font-bold text-xs text-text-primary">
                    {paymentMethod.logo ? (
                      <img
                        src={paymentMethod.logo}
                        alt={paymentMethod.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      paymentMethod.slug.slice(0, 4).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-text-muted uppercase tracking-wider">
                      Payment Method
                    </div>
                    <div className="font-bold text-text-primary text-base">
                      {paymentMethod.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <div className="text-xs text-text-muted mb-1.5">
                  Amount to Pay
                </div>
                <div className="bg-bg-secondary border border-border rounded-lg p-3 flex items-center justify-between">
                  <DualPrice
                    amountBDT={totalAmount}
                    size="md"
                    layout="inline"
                    primaryClassName="text-primary"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        totalAmount.toFixed(2),
                        "amount"
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition px-2 py-1 rounded"
                  >
                    {copiedField === "amount" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Receiving Number */}
              {paymentMethod.accountNumber && (
                <div>
                  <div className="text-xs text-text-muted mb-1.5">
                    Send Money To
                  </div>
                  <div className="bg-bg-secondary border border-border rounded-lg p-3 flex items-center justify-between">
                    <span className="font-mono font-bold text-text-primary text-base">
                      {paymentMethod.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          paymentMethod.accountNumber!,
                          "account"
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition px-2 py-1 rounded"
                    >
                      {copiedField === "account" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-success" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Merchant number */}
              {paymentMethod.merchantNumber && (
                <div>
                  <div className="text-xs text-text-muted mb-1.5">
                    Merchant Number
                  </div>
                  <div className="bg-bg-secondary border border-border rounded-lg p-3 flex items-center justify-between">
                    <span className="font-mono font-bold text-text-primary text-base">
                      {paymentMethod.merchantNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          paymentMethod.merchantNumber!,
                          "merchant"
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition px-2 py-1 rounded"
                    >
                      {copiedField === "merchant" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-success" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div className="text-xs text-text-secondary leading-relaxed">
                    <strong className="text-warning">Note:</strong> উপরের
                    number-এ ঠিক{" "}
                    <strong className="text-text-primary">
                      ৳{totalAmount.toFixed(2)}
                    </strong>{" "}
                    sent করুন। Payment সম্পন্ন করার পর নিচের form-এ details
                    দিন।
                  </div>
                </div>
              </div>

              {/* Custom instructions from admin */}
              {paymentMethod.instructions && (
                <div className="pt-3 border-t border-border">
                  <div className="text-xs font-semibold text-text-secondary mb-2">
                    Instructions
                  </div>
                  <p className="text-xs text-text-muted whitespace-pre-wrap leading-relaxed">
                    {paymentMethod.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          {methodFields.length > 0 && (
            <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-text-primary text-base">
                  Submit Payment Details
                </h2>
              </div>

              <div className="space-y-4">
                {methodFields.map((field: any) => {
                  const error = paymentFieldErrors[field.name];
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        {field.label}
                        {field.required && (
                          <span className="text-danger ml-0.5">*</span>
                        )}
                      </label>

                      {field.fieldType === "textarea" ? (
                        <textarea
                          value={paymentFieldValues[field.name] || ""}
                          onChange={(e) =>
                            handlePaymentFieldChange(
                              field.name,
                              e.target.value
                            )
                          }
                          placeholder={
                            field.placeholder || `Enter ${field.label}`
                          }
                          rows={3}
                          className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary transition resize-none ${
                            error ? "border-danger" : "border-border"
                          }`}
                        />
                      ) : (
                        <input
                          type={
                            field.fieldType === "number"
                              ? "number"
                              : field.fieldType
                          }
                          value={paymentFieldValues[field.name] || ""}
                          onChange={(e) =>
                            handlePaymentFieldChange(
                              field.name,
                              e.target.value
                            )
                          }
                          placeholder={
                            field.placeholder || `Enter ${field.label}`
                          }
                          className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary transition ${
                            error ? "border-danger" : "border-border"
                          }`}
                        />
                      )}

                      {field.helpText && !error && (
                        <p className="mt-1 text-[10px] text-text-dim">
                          {field.helpText}
                        </p>
                      )}

                      {error && (
                        <p className="mt-1 text-xs text-danger">{error}</p>
                      )}
                    </div>
                  );
                })}

                {/* Confirmation */}
                <label className="flex items-start gap-2.5 cursor-pointer bg-bg-secondary rounded-lg p-3.5">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-primary rounded shrink-0"
                  />
                  <span className="text-xs text-text-secondary leading-relaxed">
                    আমি নিশ্চিত করছি যে আমি উপরের number-এ{" "}
                    <strong className="text-text-primary">
                      ৳{totalAmount.toFixed(2)}
                    </strong>{" "}
                    sent করেছি এবং দেওয়া তথ্য সঠিক।
                  </span>
                </label>
              </div>
            </div>
          )}
        </>
      )}

      {/* Total + Place Order */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm text-text-muted">Total Amount</span>
          <DualPrice
            amountBDT={totalAmount}
            size="xl"
            layout="stacked"
            primaryClassName="text-primary"
          />
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={
            isPending ||
            (paymentType === "wallet" && walletBalance < totalAmount)
          }
          className="w-full bg-gradient-primary text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Order তৈরি হচ্ছে...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Place Order
            </>
          )}
        </button>

        <p className="text-[10px] text-text-muted text-center mt-3">
          🔒 100% secure payment guaranteed
        </p>
      </div>
    </div>
  );
}