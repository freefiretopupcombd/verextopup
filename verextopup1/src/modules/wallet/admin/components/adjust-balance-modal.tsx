"use client";

import { useState, useTransition } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adjustBalanceAction } from "../actions";
import {
  REASON_LABELS,
  MAX_ADJUST_AMOUNT,
} from "../validations";

type Wallet = {
  userId: string;
  balance: number;
  user: {
    email: string;
    name: string | null;
  } | null;
};

export function AdjustBalanceModal({
  wallet,
  onClose,
}: {
  wallet: Wallet;
  onClose: () => void;
}) {
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("MANUAL_CREDIT");
  const [note, setNote] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();

  const amountNum = Number(amount) || 0;
  const newBalance =
    type === "CREDIT" ? wallet.balance + amountNum : wallet.balance - amountNum;
  const insufficient = type === "DEBIT" && newBalance < 0;
  const overLimit = amountNum > MAX_ADJUST_AMOUNT;
  const canSubmit =
    amountNum > 0 &&
    !insufficient &&
    !overLimit &&
    note.trim().length >= 10 &&
    confirmation.trim().toUpperCase() === "CONFIRM" &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData();
    formData.set("userId", wallet.userId);
    formData.set("type", type);
    formData.set("amount", amount);
    formData.set("reason", reason);
    formData.set("note", note);
    formData.set("confirmationCode", confirmation);

    startTransition(async () => {
      const result = await adjustBalanceAction({ success: false }, formData);
      if (result.success) {
        toast.success(result.message || "সফল");
        onClose();
      } else {
        toast.error(result.message || "ব্যর্থ");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div
        className="bg-bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-bg-card z-10">
          <div>
            <h3 className="font-bold text-text-primary">Adjust Balance</h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              {wallet.user?.name || wallet.user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted"
            disabled={isPending}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Current balance */}
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Current Balance
            </div>
            <div className="text-xl font-bold text-text-primary mt-0.5">
              ৳{wallet.balance.toFixed(2)}
            </div>
          </div>

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType("CREDIT");
                  setReason("MANUAL_CREDIT");
                }}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                  type === "CREDIT"
                    ? "border-success bg-success/10 text-success"
                    : "border-border text-text-secondary hover:border-success/50"
                }`}
              >
                + Credit
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("DEBIT");
                  setReason("MANUAL_DEBIT");
                }}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                  type === "DEBIT"
                    ? "border-danger bg-danger/10 text-danger"
                    : "border-border text-text-secondary hover:border-danger/50"
                }`}
              >
                − Debit
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Amount (৳) — max ৳{MAX_ADJUST_AMOUNT.toLocaleString()}
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={MAX_ADJUST_AMOUNT}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary"
            >
              {type === "CREDIT" ? (
                <>
                  <option value="MANUAL_CREDIT">Manual Credit</option>
                  <option value="BONUS">Bonus</option>
                  <option value="COMPENSATION">Compensation</option>
                  <option value="CORRECTION">Correction</option>
                  <option value="REFUND">Refund</option>
                </>
              ) : (
                <>
                  <option value="MANUAL_DEBIT">Manual Debit</option>
                  <option value="PENALTY">Penalty</option>
                  <option value="CORRECTION">Correction</option>
                </>
              )}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Note * (min 10 chars)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="কেন এই adjustment করছেন বিস্তারিত লিখুন..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary resize-none"
              maxLength={500}
            />
            <div className="text-[10px] text-text-muted mt-1 text-right">
              {note.length}/500
            </div>
          </div>

          {/* Preview */}
          {amountNum > 0 && (
            <div
              className={`rounded-lg p-3 border ${
                insufficient
                  ? "bg-danger/10 border-danger/30"
                  : "bg-bg-secondary border-border"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                New Balance After
              </div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  insufficient
                    ? "text-danger"
                    : type === "CREDIT"
                      ? "text-success"
                      : "text-warning"
                }`}
              >
                ৳{Math.max(0, newBalance).toFixed(2)}
              </div>
              {insufficient && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Balance পর্যাপ্ত নয়
                </p>
              )}
              {overLimit && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Max ৳{MAX_ADJUST_AMOUNT.toLocaleString()} per transaction
                </p>
              )}
            </div>
          )}

          {/* Confirmation */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-text-primary">
                এই action <strong>permanent</strong> — user-কে notification যাবে এবং
                audit log এ record হবে। নিশ্চিত হলে নিচে <strong>CONFIRM</strong> লিখুন।
              </p>
            </div>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder='Type "CONFIRM"'
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-primary hover:bg-bg-secondary transition text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                type === "CREDIT"
                  ? "bg-success hover:bg-success/90"
                  : "bg-danger hover:bg-danger/90"
              }`}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending
                ? "Processing..."
                : type === "CREDIT"
                  ? `Add ৳${amountNum.toFixed(2)}`
                  : `Remove ৳${amountNum.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}