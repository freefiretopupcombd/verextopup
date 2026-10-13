"use client";

import { useState, useTransition } from "react";
import { X, Ban, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changeStatusAction } from "../actions";
import { USER_STATUSES } from "../validations";

type User = {
  id: string;
  email: string;
  name: string | null;
  status: string;
};

export function ChangeStatusModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(user.status);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit =
    status !== user.status && reason.trim().length >= 10 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    fd.set("userId", user.id);
    fd.set("status", status);
    fd.set("reason", reason);

    startTransition(async () => {
      const result = await changeStatusAction({ success: false }, fd);
      if (result.success) {
        toast.success(result.message || "Status পরিবর্তন হয়েছে");
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
            <Ban className="w-4 h-4 text-warning" />
            <h3 className="font-bold text-text-primary">Change Status</h3>
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
            <div className="text-sm font-medium text-text-primary">
              {user.name || user.email}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              Current: <span className="font-bold">{user.status}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              New Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
            >
              {USER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Reason * (min 10 chars)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="কেন status পরিবর্তন করছেন..."
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
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-warning hover:bg-warning/90 text-white text-sm font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}