"use client";

import { useState, useTransition } from "react";
import {
  X,
  Shield,
  Loader2,
  Crown,
  UserCheck,
  User as UserIcon,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { changeRoleAction } from "../actions";
import { ROLES } from "../validations";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

const ROLE_INFO = {
  CUSTOMER: {
    label: "Customer",
    icon: UserIcon,
    color: "text-text-secondary",
    bg: "bg-bg-secondary",
    description: "Regular user — order করতে পারবে",
  },
  ADMIN: {
    label: "Admin",
    icon: UserCheck,
    color: "text-accent",
    bg: "bg-accent/10",
    description: "Admin panel access — user/product manage",
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    description: "Full access — সব কিছু control করতে পারবে",
  },
} as const;

export function ChangeRoleModal({
  user,
  currentUserId,
  onClose,
}: {
  user: User;
  currentUserId?: string;
  onClose: () => void;
}) {
  const [role, setRole] = useState(user.role);
  const [reason, setReason] = useState("");
  const [confirmSuperAdmin, setConfirmSuperAdmin] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSelf = currentUserId === user.id;
  const isPromotingToSuperAdmin =
    role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN";
  const isDemotingFromSuperAdmin =
    user.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN";

  const canSubmit =
    role !== user.role &&
    reason.trim().length >= 10 &&
    (!isPromotingToSuperAdmin || confirmSuperAdmin) &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    fd.set("userId", user.id);
    fd.set("role", role);
    fd.set("reason", reason);
    if (confirmSuperAdmin) fd.set("confirmSuperAdmin", "yes");

    startTransition(async () => {
      const result = await changeRoleAction({ success: false }, fd);
      if (result.success) {
        toast.success(result.message || "Role পরিবর্তন হয়েছে");
        onClose();
      } else {
        toast.error(result.message || "ব্যর্থ");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-bg-card z-10">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-text-primary">Change Role</h3>
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
          {/* User info */}
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              User
            </div>
            <div className="text-sm font-medium text-text-primary mt-0.5">
              {user.name || user.email}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              Current:{" "}
              <span className="font-bold">
                {ROLE_INFO[user.role as keyof typeof ROLE_INFO]?.label ||
                  user.role}
              </span>
              {isSelf && (
                <span className="ml-2 text-[10px] uppercase bg-primary/15 text-primary px-1.5 py-0.5 rounded font-bold">
                  You
                </span>
              )}
            </div>
          </div>

          {/* Role Selection — Cards */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">
              New Role *
            </label>
            <div className="space-y-2">
              {ROLES.map((r) => {
                const info = ROLE_INFO[r];
                const Icon = info.icon;
                const selected = role === r;
                const isCurrent = user.role === r;

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => !isCurrent && setRole(r)}
                    disabled={isCurrent || isPending}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition text-left ${
                      isCurrent
                        ? "border-border bg-bg-secondary/50 opacity-60 cursor-not-allowed"
                        : selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${info.bg} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <Icon className={`w-4 h-4 ${info.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-sm ${
                            selected ? "text-primary" : "text-text-primary"
                          }`}
                        >
                          {info.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] uppercase bg-bg-secondary text-text-muted px-1.5 py-0.5 rounded font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {info.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning — self demotion from SUPER_ADMIN */}
          {isSelf && isDemotingFromSuperAdmin && (
            <div className="bg-danger/5 border border-danger/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-danger font-bold">
                    ⛔ নিজের SUPER_ADMIN demote করা যাবে না
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    System lockout এড়াতে এই action block করা হবে। অন্য
                    SUPER_ADMIN কে দিয়ে করান।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning — demoting other SUPER_ADMIN */}
          {!isSelf && isDemotingFromSuperAdmin && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-warning font-bold">
                    ⚠️ SUPER_ADMIN ডিমোট করা হচ্ছে
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    এই user এর সব SUPER_ADMIN privileges চলে যাবে। যদি এটি শেষ
                    SUPER_ADMIN হয়, system error দেবে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation — promoting to SUPER_ADMIN */}
          {isPromotingToSuperAdmin && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-3">
                <Crown className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-primary font-bold">
                    👑 SUPER_ADMIN বানানো হচ্ছে
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {isSelf
                      ? "⚠️ আপনি নিজেকে SUPER_ADMIN বানাচ্ছেন — সম্পূর্ণ admin access পাবেন।"
                      : "এই user সম্পূর্ণ admin access পাবেন — wallet, users, settings সব কিছু modify করতে পারবেন।"}
                  </p>
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmSuperAdmin}
                  onChange={(e) => setConfirmSuperAdmin(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-primary rounded"
                />
                <span className="text-xs text-text-primary">
                  আমি নিশ্চিত — {isSelf ? "নিজেকে" : "এই user কে"} SUPER_ADMIN
                  বানাতে চাই
                </span>
              </label>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Reason * (min 10 chars)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="কেন role পরিবর্তন করছেন বিস্তারিত লিখুন..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary resize-none text-sm"
              maxLength={500}
            />
            <div className="text-[10px] text-text-muted mt-1 text-right">
              {reason.length}/500
            </div>
          </div>

          {/* Actions */}
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
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Updating..." : "Change Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}