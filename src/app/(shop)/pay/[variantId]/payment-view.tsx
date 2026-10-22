"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Wallet,
  Zap,
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Complete Your Payment
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Please complete the payment to proceed
          </p>
        </div>

        {/* Product & Amount Info Box (Exactly as your screenshot) */}
        <div className="bg-[#1A1F2E] rounded-xl p-4 flex items-center justify-between shadow-lg border border-[#2A3143]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0B0F19] flex items-center justify-center border border-[#2A3143] overflow-hidden shrink-0">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">{product.icon || "🎮"}</span>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">
                Invoice ID
              </p>
              <p className="text-sm font-bold text-white tracking-wide">
                {variant.id.slice(0, 10).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">
              Amount
            </p>
            <p className="text-lg font-bold text-white">
              ৳{totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Wallet Payment Section */}
        {paymentType === "wallet" && (
          <div className="bg-[#1A1F2E] rounded-xl p-5 border border-[#2A3143] shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-white">Wallet Payment</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Your Balance</span>
                <span className="text-white">৳{walletBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total</span>
                <span className="text-white">৳{totalAmount.toFixed(2)}</span>
              </div>
              {walletBalance < totalAmount && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">
                    Wallet-এ যথেষ্ট balance নেই। Recharge করুন।
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instant Payment Section (Now in Dark Theme) */}
        {paymentType === "instant" && paymentMethod && (
          <div className="bg-[#1A1F2E] border border-[#2A3143] rounded-xl p-5 shadow-lg space-y-5">
            
            {/* Payment Method Header */}
            <div className="flex items-center gap-3 border-b border-[#2A3143] pb-4">
              <div className="w-10 h-10 rounded bg-[#0B0F19] flex items-center justify-center border border-[#2A3143] overflow-hidden">
                {paymentMethod.logo ? (
                  <img
                    src={paymentMethod.logo}
                    alt={paymentMethod.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="font-bold text-xs text-slate-300">
                    {paymentMethod.slug.slice(0, 4).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Payment Method
                </p>
                <h3 className="text-sm font-bold text-white">
                  {paymentMethod.name}
                </h3>
              </div>
            </div>

            {/* Instruction Note */}
            <p className="text-sm text-slate-300">
              Send exactly <strong className="text-white">৳{totalAmount.toFixed(2)}</strong> to the number below
            </p>

            {/* Dynamic Account Number with Copy Button */}
            {paymentMethod.accountNumber && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400">
                  Payment Number
                </label>
                <div className="bg-[#0B0F19] border border-[#2A3143] rounded-lg p-3.5 flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-lg">
                    {paymentMethod.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(paymentMethod.accountNumber!, "account")
                    }
                    className="text-slate-400 hover:text-white transition p-1"
                  >
                    {copiedField === "account" ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Input Fields from Admin */}
            {methodFields.map((field: any) => {
              const error = paymentFieldErrors[field.name];
              return (
                <div key={field.name} className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.fieldType === "textarea" ? (
                    <textarea
                      value={paymentFieldValues[field.name] || ""}
                      onChange={(e) =>
                        handlePaymentFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder || `Enter ${field.label}`}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg bg-[#0B0F19] border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none ${
                        error ? "border-red-500" : "border-[#2A3143]"
                      }`}
                    />
                  ) : (
                    <input
                      type={field.fieldType === "number" ? "number" : field.fieldType}
                      value={paymentFieldValues[field.name] || ""}
                      onChange={(e) =>
                        handlePaymentFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder || `Enter ${field.label}`}
                      className={`w-full px-4 py-3 rounded-lg bg-[#0B0F19] border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition ${
                        error ? "border-red-500" : "border-[#2A3143]"
                      }`}
                    />
                  )}
                  {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                </div>
              );
            })}

            {/* Confirmation Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#2A3143] bg-[#0B0F19] text-indigo-500 focus:ring-indigo-500 shrink-0"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I confirm that I have sent <strong className="text-white">৳{totalAmount.toFixed(2)}</strong> to the above number.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={
              isPending ||
              (paymentType === "wallet" && walletBalance < totalAmount)
            }
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Place Order
              </>
            )}
          </button>
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4" /> 100% secure payment guaranteed
        </p>

      </div>
    </div>
  );
}