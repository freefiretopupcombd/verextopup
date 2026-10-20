"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  updateCurrencySettingsAction,
  type ActionState,
} from "../actions";

const initialState: ActionState = { success: false };

export function CurrencyForm({
  initialUsdToBdt,
  initialDefaultCurrency,
}: {
  initialUsdToBdt: number;
  initialDefaultCurrency: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateCurrencySettingsAction,
    initialState
  );

  const [rate, setRate] = useState(initialUsdToBdt);
  const [example, setExample] = useState({ bdt: 1000, usdt: 0 });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Updated");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  useEffect(() => {
    setExample({
      bdt: 1000,
      usdt: rate > 0 ? 1000 / rate : 0,
    });
  }, [rate]);

  return (
    <form action={formAction} className="space-y-6">
      {/* USD → BDT */}
      <div>
        <label className="block text-sm font-medium text-content mb-1.5">
          1 USD (USDT) = কত BDT? *
        </label>
        <input
          name="usdToBdt"
          type="number"
          step="0.01"
          required
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-semibold"
        />
        {state.errors?.usdToBdt && (
          <p className="mt-1.5 text-sm text-error">
            {state.errors.usdToBdt[0]}
          </p>
        )}
        <p className="mt-1.5 text-xs text-content-muted">
          এই rate ব্যবহার করে সব product price USDT-এ convert হবে।
        </p>
      </div>

      {/* Default Currency */}
      <div>
        <label className="block text-sm font-medium text-content mb-1.5">
          Default Currency (নতুন user-দের জন্য)
        </label>
        <select
          name="defaultCurrency"
          defaultValue={initialDefaultCurrency}
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="BDT">৳ BDT (বাংলাদেশি টাকা)</option>
          <option value="USDT">₮ USDT (Tether)</option>
        </select>
      </div>

      {/* Live Preview */}
      <div className="bg-muted rounded-lg p-4 border border-border">
        <h3 className="text-sm font-semibold text-content mb-3">
          📊 Live Preview
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-content-muted">Current rate:</span>
            <span className="font-medium text-content">
              1 USD = ৳{rate || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-content-muted">Example:</span>
            <span className="font-medium text-content">
              ৳1,000 = ₮{example.usdt.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-content-muted">Reverse:</span>
            <span className="font-medium text-content">
              ₮1.00 = ৳{rate || 0} BDT
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? "Saving..." : "Save Currency Settings"}
      </button>
    </form>
  );
}