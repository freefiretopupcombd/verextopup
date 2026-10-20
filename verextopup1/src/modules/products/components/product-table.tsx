"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";

import { deleteProductAction } from "../actions";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  thumbnail: string | null;
  icon: string | null;
  price: number | string;
  currency: string;
  status: string;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  soldCount: number;
  category: { id: string; name: string } | null;
  _count: { variants: number };
};

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      setDeletingId(id);
      const result = await deleteProductAction(id);
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
                Product
              </th>
              <th className="text-left px-4 py-3 font-semibold text-content hidden md:table-cell">
                Category
              </th>
              <th className="text-center px-4 py-3 font-semibold text-content">
                Variations
              </th>
              <th className="text-right px-4 py-3 font-semibold text-content hidden sm:table-cell">
                Base Price
              </th>
              <th className="text-center px-4 py-3 font-semibold text-content">
                Status
              </th>
              <th className="text-right px-4 py-3 font-semibold text-content">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : p.icon ? (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xl shrink-0">
                        {p.icon}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-content truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-content-muted font-mono truncate">
                        /{p.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-content-muted hidden md:table-cell">
                  {p.category?.name || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                    {p._count.variants} variation
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <div className="font-semibold text-content">
                    ৳{Number(p.price).toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      p.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : p.status === "DRAFT"
                          ? "bg-warning/10 text-warning"
                          : "bg-content-muted/10 text-content-muted"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="p-2 rounded hover:bg-muted text-content-muted hover:text-content transition"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="p-2 rounded hover:bg-muted text-content-muted hover:text-primary transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setConfirmId(p.id)}
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

      {/* Confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-card p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-content">
                  Product delete করবেন?
                </h3>
                <p className="text-sm text-content-muted mt-1">
                  Order থাকলে product archive হবে (delete হবে না)।
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={isPending && deletingId === confirmId}
                className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-white font-medium transition flex items-center gap-2 disabled:opacity-60"
              >
                {isPending && deletingId === confirmId && (
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