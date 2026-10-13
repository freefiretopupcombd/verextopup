"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { deleteCategoryAction } from "../actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  icon: string | null;
  sortOrder: number;
  parent: { id: string; name: string } | null;
  _count: {
    products: number;
    children: number;
  };
};

export function CategoryTable({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      setDeletingId(id);
      const result = await deleteCategoryAction(id);

      if (result.success) {
        toast.success(result.message || "Deleted");
        setConfirmId(null);
        router.refresh();
      } else {
        toast.error(result.message || "Delete failed");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-content">
                Category
              </th>
              <th className="text-left px-4 py-3 font-semibold text-content">
                Parent
              </th>
              <th className="text-center px-4 py-3 font-semibold text-content">
                Products
              </th>
              <th className="text-center px-4 py-3 font-semibold text-content">
                Status
              </th>
              <th className="text-center px-4 py-3 font-semibold text-content">
                Order
              </th>
              <th className="text-right px-4 py-3 font-semibold text-content">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {cat.icon && (
                      <span className="text-xl shrink-0">{cat.icon}</span>
                    )}
                    <div>
                      <div className="font-medium text-content flex items-center gap-2">
                        {cat.name}
                        {cat.isFeatured && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-content-muted font-mono">
                        /{cat.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-content-muted">
                  {cat.parent?.name || "—"}
                </td>
                <td className="px-4 py-3 text-center text-content-muted">
                  {cat._count.products}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      cat.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : "bg-content-muted/10 text-content-muted"
                    }`}
                  >
                    {cat.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-content-muted">
                  {cat.sortOrder}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/categories/${cat.id}/edit`}
                      className="p-2 rounded hover:bg-muted text-content-muted hover:text-primary transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setConfirmId(cat.id)}
                      className="p-2 rounded hover:bg-error/10 text-content-muted hover:text-error transition"
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

      {/* Confirm Modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-card p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-content">
                  Category delete করবেন?
                </h3>
                <p className="text-sm text-content-muted mt-1">
                  এটা undo করা যাবে না।
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition text-content"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={isPending || deletingId === confirmId}
                className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-white font-medium transition flex items-center gap-2 disabled:opacity-60"
              >
                {deletingId === confirmId && (
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