"use client";

import { useState, useTransition } from "react";
import { X, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { rejectTopUpAction } from "@/modules/wallet/actions";

type TopUp = {
  id: string;
  referenceNumber: string;
  amount: number;
  user: {
    email: string;
    name: string | null;
  };
};

const REJECT_REASONS = [
  "Transaction ID ভুল",
  "Screenshot নেই / অস্পষ্ট",
  "Amount mismatch হয়েছে",
  "Duplicate request",
  "Payment পাওয়া যায়নি",
  "ভুয়া তথ্য দেওয়া হয়েছে",
  "অন্য কিছু (নিচে লিখুন)",
];

export function RejectTopUpModal({
  topUp,
  onClose,
}: {
  topUp: TopUp;
  onClose: () => void;
}) {
  const [selectedReason, setSelectedReason] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const isCustom = selectedReason === "অন্য কিছু (নিচে লিখুন)";
  const finalReason = isCustom ? customReason.trim() : selectedReason;
  const canSubmit = finalReason.length >= 10 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    startTransition(async () => {
      const result = await rejectTopUpAction(topUp.id, finalReason);
      if (result.success) {
        toast.success("Top-up rejected");
        onClose();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-danger" />
            <h3 className="font-bold text-text-primary">Reject Top-Up</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-bg-secondary rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">User:</span>
              <span className="text-text-primary font-medium">
                {topUp.user.name || topUp.user.email}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Amount:</span>
              <span className="text-danger font-bold">
                ৳{topUp.amount.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Rejection Reason *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
            >
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {isCustom && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Custom Reason * (min 10 chars)
              </label>
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="বিস্তারিত লিখুন..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary resize-none text-sm"
                maxLength={500}
              />
              <div className="text-[10px] text-text-muted mt-1 text-right">
                {customReason.length}/500
              </div>
            </div>
          )}

          <div className="bg-danger/5 border border-danger/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-text-primary">
                Reject করলে user-কে notification যাবে এবং এই request আর
                approve করা যাবে না।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-primary hover:bg-bg-secondary transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-danger hover:bg-danger/90 text-white text-sm font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}