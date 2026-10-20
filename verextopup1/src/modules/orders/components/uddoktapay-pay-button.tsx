"use client";

import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

import { createUddoktaPaySessionAction } from "@/modules/payments/actions";

type Props = {
  variantId: string;
  quantity: number;
  fields: Record<string, string>;
  disabled?: boolean;
};

export function UddoktaPayButton({
  variantId,
  quantity,
  fields,
  disabled,
}: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);

    try {
      const result = await createUddoktaPaySessionAction({
        variantId,
        quantity,
        fields,
      });

      if (result.success && result.paymentUrl) {
        toast.success("Redirecting to payment...");
        // Small delay so user sees the toast
        setTimeout(() => {
          window.location.href = result.paymentUrl!;
        }, 300);
      } else {
        toast.error(result.message || "Payment failed");
        setIsPending(false);
      }
    } catch (error) {
      console.error("UddoktaPay button error:", error);
      toast.error("কিছু ভুল হয়েছে");
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      className="w-full bg-gradient-primary text-white font-semibold px-6 py-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg hover:shadow-primary/25"
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Zap className="w-5 h-5" />
      )}
      {isPending ? "Redirecting..." : "Pay with UddoktaPay"}
    </button>
  );
}