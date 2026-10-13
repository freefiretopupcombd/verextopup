"use client";

import { useState, useTransition } from "react";
import { X, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { approveTopUpSafeAction } from "../actions";

type TopUp = {
  id: string;
  referenceNumber: string;
  amount: number;
  user: {
    email: string;
    name: string | null;
  };
};

export function ApproveTopUpModal({
  topUp,
  onClose,
}: {
  topUp: TopUp;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    startTransition(async () => {
      const result = await approveTopUpSafeAction(topUp.id, note || undefined);
      if (result.success) {
        toast.success(result.message || "Approved");
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
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h3 className="font-bold text-text-primary">Approve Top-Up</h3>
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
              <span className="text-text-muted">Reference:</span>
              <span className="text-text-primary font-mono text-xs">
                {topUp.referenceNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Amount:</span>
              <span className="text-success font-bold text-base">
                +৳{topUp.amount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-success/5 border border-success/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="text-xs text-text-primary">
                Approve করলে user-এর wallet এ{" "}
                <strong>৳{topUp.amount.toFixed(2)}</strong> যোগ হবে এবং
                user-কে notification যাবে।
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Admin Note (optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="কিছু লিখতে চাইলে..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary resize-none text-sm"
              maxLength={500}
            />
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
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-success hover:bg-success/90 text-white text-sm font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Approving..." : "Approve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}