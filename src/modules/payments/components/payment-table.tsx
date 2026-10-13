"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import {
  deletePaymentMethodAction,
  togglePaymentStatusAction,
} from "../actions";

type PaymentMethod = {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo: string | null;
  status: string;
  sortOrder: number;
  accountNumber: string | null;
  requireTxnId: boolean;
  _count: { orders: number };
};

export function PaymentTable({ methods }: { methods: PaymentMethod[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      setBusyId(id);
      const result = await deletePaymentMethodAction(id);
      if (result.success) {
        toast.success(result.message || "Deleted");
        setConfirmId(null);
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
      setBusyId(null);
    });
  };

  const handleToggle = (id: string, currentStatus: string) => {
    startTransition(async () => {
      setBusyId(id);
      const result = await togglePaymentStatusAction(id, currentStatus);
      if (result.success) {
        toast.success(result.message || "Updated");
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
      setBusyId(null);
    });
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">
                Method
              </th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary hidden md:table-cell">
                Type
              </th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary hidden lg:table-cell">
                Account
              </th>
              <th className="text-center px-4 py-3 font-semibold text-text-primary hidden sm:table-cell">
                Orders
              </th>
              <th className="text-center px-4 py-3 font-semibold text-text-primary">
                Status
              </th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr
                key={m.id}
                className="border-b border-border last:border-0 hover:bg-bg-secondary/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-bg-secondary border border-border flex items-center justify-center shrink-0 font-bold text-xs text-text-primary overflow-hidden">
                      {m.logo ? (
                        <img
                          src={m.logo}
                          alt={m.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        m.slug.slice(0, 4).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-text-primary truncate">
                        {m.name}
                      </div>
                      <div className="text-xs text-text-muted font-mono truncate">
                        /{m.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      m.type === "AUTOMATIC"
                        ? "bg-primary/10 text-primary"
                        : "bg-bg-secondary text-text-secondary"
                    }`}
                  >
                    {m.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                  <span className="text-xs font-mono truncate">
                    {m.accountNumber || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">
                  {m._count.orders}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      m.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : "bg-text-muted/10 text-text-muted"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggle(m.id, m.status)}
                      disabled={isPending && busyId === m.id}
                      className="p-2 rounded hover:bg-bg-secondary text-text-muted hover:text-primary transition"
                      title={m.status === "ACTIVE" ? "Disable" : "Enable"}
                    >
                      {isPending && busyId === m.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : m.status === "ACTIVE" ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <Link
                      href={`/admin/payments/${m.id}/edit`}
                      className="p-2 rounded hover:bg-bg-secondary text-text-muted hover:text-primary transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setConfirmId(m.id)}
                      className="p-2 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">
                  Payment method delete করবেন?
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Order থাকলে delete হবে না — INACTIVE হয়ে যাবে।
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-bg-secondary transition text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={isPending && busyId === confirmId}
                className="px-4 py-2 rounded-lg bg-danger hover:bg-danger/90 text-white font-medium transition flex items-center gap-2 disabled:opacity-60"
              >
                {isPending && busyId === confirmId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}