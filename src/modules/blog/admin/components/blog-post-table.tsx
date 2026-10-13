"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { deleteBlogPostAction } from "../../actions";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: string;
  category: { name: string; slug: string; color: string | null } | null;
  author: { name: string | null } | null;
  viewCount: number;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-warning/15 text-warning",
  PUBLISHED: "bg-success/15 text-success",
  SCHEDULED: "bg-primary/15 text-primary",
  ARCHIVED: "bg-text-muted/15 text-text-muted",
};

export function BlogPostTable({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteBlogPostAction(id);
      if (result.success) {
        toast.success("Post delete হয়েছে");
        setConfirmId(null);
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  if (posts.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
        <p className="text-text-muted text-sm">কোনো post নেই</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-text-primary">
                  Post
                </th>
                <th className="text-left px-4 py-3 font-semibold text-text-primary hidden md:table-cell">
                  Category
                </th>
                <th className="text-center px-4 py-3 font-semibold text-text-primary">
                  Status
                </th>
                <th className="text-center px-4 py-3 font-semibold text-text-primary hidden sm:table-cell">
                  Views
                </th>
                <th className="text-right px-4 py-3 font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-bg-secondary/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.featuredImage ? (
                        <img
                          src={p.featuredImage}
                          alt={p.title}
                          className="w-12 h-12 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-xl shrink-0">
                          📝
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary truncate max-w-[280px]">
                          {p.title}
                        </div>
                        <div className="text-xs text-text-muted font-mono truncate max-w-[280px]">
                          /{p.slug}
                        </div>
                        {p.publishedAt && (
                          <div className="text-[10px] text-text-muted mt-0.5">
                            {new Date(p.publishedAt).toLocaleDateString(
                              "en-GB"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {p.category ? (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${p.category.color}15`,
                          color: p.category.color || "#7C3AED",
                        }}
                      >
                        {p.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-text-muted text-xs hidden sm:table-cell">
                    {p.viewCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        className="p-2 rounded hover:bg-bg-secondary text-text-muted hover:text-text-primary transition"
                        title="View"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${p.id}/edit`}
                        className="p-2 rounded hover:bg-bg-secondary text-text-muted hover:text-primary transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setConfirmId(p.id)}
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
      </div>

      {/* Confirm Delete */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border rounded-xl p-5 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Post delete?</h3>
                <p className="text-sm text-text-muted mt-1">
                  এটা undo করা যাবে না।
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-bg-secondary text-text-primary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-danger hover:bg-danger/90 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}