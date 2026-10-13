"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Wallet as WalletIcon,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { DualPrice } from "@/modules/currency/components/dual-price";
import { createWalletTopUpAction } from "../actions";
import { QUICK_AMOUNTS, MIN_TOPUP } from "../validations";

type PaymentMethod = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  instructions: string | null;
  accountNumber: string | null;
  merchantNumber: string | null;
  inputFields: any[];
};

export function RechargeView({
  paymentMethods,
  currentBalance,
}: {
  paymentMethods: PaymentMethod[];
  currentBalance: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<"amount" | "method" | "success">("amount");
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    paymentMethods[0]?.id || null
  );
  const [paymentFields, setPaymentFields] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);
  const methodFields: any[] = Array.isArray(selectedMethod?.inputFields)
    ? [...selectedMethod.inputFields].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      )
    : [];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFieldChange = (name: string, value: string) => {
    setPaymentFields((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validatePayment = () => {
    const errors: Record<string, string> = {};
    for (const field of methodFields) {
      if (field.required && !paymentFields[field.name]?.trim()) {
        errors[field.name] = `${field.label} দিতে হবে`;
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (amount < MIN_TOPUP) {
      toast.error(`সর্বনিম্ন ৳${MIN_TOPUP}`);
      return;
    }
    if (!selectedMethodId) {
      toast.error("Payment method select করুন");
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

    const formData = new FormData();
    formData.set("amount", String(amount));
    formData.set("paymentMethodId", selectedMethodId);
    formData.set("paymentFields", JSON.stringify(paymentFields));

    startTransition(async () => {
      const result = await createWalletTopUpAction(formData);
      if (result.success && result.referenceNumber) {
        setSuccessRef(result.referenceNumber);
        setStep("success");
        toast.success(result.message || "Top-up submitted!");
      } else {
        toast.error(result.message || "Top-up failed");
      }
    });
  };

  // ==================================================
  // SUCCESS SCREEN
  // ==================================================
  if (step === "success" && successRef) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 sm:p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
          Top-Up Request Submitted!
        </h2>
        <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
          Admin আপনার payment verify করবে। Verify হলে wallet-এ ৳{amount.toFixed(2)}{" "}
          যোগ হবে (সাধারণত ৫-৩০ মিনিট)।
        </p>

        <div className="bg-bg-secondary border border-border rounded-lg p-4 mb-6 max-w-sm mx-auto">
          <div className="text-xs text-text-muted mb-1">Reference Number</div>
          <div className="font-mono font-bold text-primary text-base">
            {successRef}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/account/wallet")}
            className="bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Back to Wallet
          </button>
          <button
            onClick={() => {
              setStep("amount");
              setSuccessRef(null);
              setAmount(100);
              setCustomAmount("");
              setPaymentFields({});
              setConfirmed(false);
            }}
            className="bg-bg-card border border-border hover:border-primary text-text-primary font-medium px-6 py-3 rounded-lg transition"
          >
            Top-Up Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Balance */}
      <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-primary" />
          <span className="text-sm text-text-muted">Current Balance</span>
        </div>
        <span className="font-bold text-text-primary text-lg">
          ৳{currentBalance.toFixed(2)}
        </span>
      </div>

      {/* Amount Selection */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            1
          </div>
          <h2 className="font-bold text-text-primary text-base">
            Amount Select করুন
          </h2>
        </div>

        {/* Quick amounts */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setAmount(amt);
                setCustomAmount("");
              }}
              className={`py-2.5 rounded-lg border-2 transition text-sm font-semibold ${
                amount === amt && !customAmount
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-bg-secondary text-text-primary hover:border-border-light"
              }`}
            >
              ৳{amt}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">
            অথবা custom amount (min ৳{MIN_TOPUP})
          </label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) setAmount(val);
            }}
            placeholder="যেমন 1500"
            className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        {amount > 0 && (
          <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
            <span className="text-xs text-text-muted">You will add:</span>
            <DualPrice
              amountBDT={amount}
              size="lg"
              layout="inline"
              primaryClassName="text-primary ml-2"
            />
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            2
          </div>
          <h2 className="font-bold text-text-primary text-base">
            Payment Method
          </h2>
        </div>

        {paymentMethods.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">
            কোনো payment method নেই
          </p>
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const isSel = selectedMethodId === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethodId(method.id);
                    setPaymentFields({});
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition text-left ${
                    isSel
                      ? "border-primary bg-primary/10"
                      : "border-border bg-bg-secondary hover:border-border-light"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSel ? "border-primary bg-primary" : "border-text-dim"
                    }`}
                  >
                    {isSel && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-md bg-bg-card border border-border flex items-center justify-center shrink-0 font-bold text-[10px] text-text-primary">
                    {method.logo ? (
                      <img
                        src={method.logo}
                        alt={method.name}
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      method.slug.slice(0, 4).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
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

      {/* Payment Instructions + Form */}
      {selectedMethod && (
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h2 className="font-bold text-text-primary text-base">
              Send Money + Submit
            </h2>
          </div>

          <div className="space-y-4">
            {/* Amount to send */}
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <div className="text-xs text-text-muted mb-1">Amount to Send</div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  ৳{amount.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(amount.toFixed(2), "amount")}
                  className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary transition"
                >
                  {copiedField === "amount" ? (
                    <>
                      <Check className="w-3 h-3 text-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Receiving number */}
            {selectedMethod.accountNumber && (
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                <div className="text-xs text-text-muted mb-1">
                  Send Money To
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-text-primary text-base">
                    {selectedMethod.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(selectedMethod.accountNumber!, "acc")
                    }
                    className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary transition shrink-0"
                  >
                    {copiedField === "acc" ? (
                      <>
                        <Check className="w-3 h-3 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Custom instructions */}
            {selectedMethod.instructions && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                    {selectedMethod.instructions}
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic fields */}
            {methodFields.length > 0 && (
              <div className="pt-3 border-t border-border space-y-3">
                {methodFields.map((field: any) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      {field.label}
                      {field.required && (
                        <span className="text-danger ml-0.5">*</span>
                      )}
                    </label>

                    <input
                      type={
                        field.fieldType === "number" ? "number" : field.fieldType
                      }
                      value={paymentFields[field.name] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder || `Enter ${field.label}`}
                      className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary transition ${
                        fieldErrors[field.name]
                          ? "border-danger"
                          : "border-border"
                      }`}
                    />

                    {fieldErrors[field.name] && (
                      <p className="mt-1 text-xs text-danger">
                        {fieldErrors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Confirm */}
            <label className="flex items-start gap-2.5 cursor-pointer bg-bg-secondary rounded-lg p-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-primary rounded shrink-0"
              />
              <span className="text-xs text-text-secondary leading-relaxed">
                আমি নিশ্চিত করছি যে আমি উপরের number-এ{" "}
                <strong className="text-text-primary">
                  ৳{amount.toFixed(2)}
                </strong>{" "}
                sent করেছি এবং দেওয়া তথ্য সঠিক।
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || !selectedMethodId || amount < MIN_TOPUP}
        className="w-full bg-gradient-primary text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <WalletIcon className="w-5 h-5" />
            Submit Top-Up Request
          </>
        )}
      </button>
    </div>
  );
}