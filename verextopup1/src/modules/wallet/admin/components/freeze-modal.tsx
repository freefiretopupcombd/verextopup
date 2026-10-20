"use client";

import { useState, useTransition } from "react";
import { X, Snowflake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { freezeWalletAction } from "../actions";

type Wallet = {
  userId: string;
  status: string;
  user: {
    email: string;
    name: string | null;
  } | null;
};

export function FreezeWalletModal({
  wallet,
  onClose,
}: {
  wallet: Wallet;
  onClose: () => void;
}) {
  const frozen = wallet.status === "FROZEN";
  const action = frozen ? "UNFREEZE" : "FREEZE";

  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit = reason.trim().length >= 10 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    fd.set("userId", wallet.userId);
    fd.set("action", action);
    fd.set("reason", reason);

    startTransition(async () => {
      const result = await freezeWalletAction({ success: false }, fd);
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
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-warning" />
            <h3 className="font-bold text-text-primary">
              {frozen ? "Unfreeze" : "Freeze"} Wallet
            </h3>
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
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              User
            </div>
            <div className="text-sm font-medium text-text-primary mt-0.5">
              {wallet.user?.name || wallet.user?.email}
            </div>
          </div>

          <div
            className={`rounded-lg p-3 text-xs ${
              frozen
                ? "bg-success/5 border border-success/20 text-text-primary"
                : "bg-warning/5 border border-warning/20 text-text-primary"
            }`}
          >
            {frozen
              ? "Unfreeze করলে user আবার wallet use করতে পারবে।"
              : "Freeze করলে user কোনো credit/debit বা order payment করতে পারবে না।"}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Reason * (min 10 chars)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="কেন freeze/unfreeze করছেন..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary resize-none"
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
              disabled={!canSubmit}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-50 ${
                frozen
                  ? "bg-success hover:bg-success/90"
                  : "bg-warning hover:bg-warning/90"
              }`}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {frozen ? "Unfreeze" : "Freeze"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}