"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Folder,
} from "lucide-react";
import { toast } from "sonner";

import {
  createBlogCategoryAction,
  deleteBlogCategoryAction,
  type ActionState,
} from "../../actions";
import { generateSlug } from "../../validations";

const initialState: ActionState = { success: false };

export function CategoryManager({
  categories,
}: {
  categories: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    postCount: number;
  }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [state, formAction, actionPending] = useActionState(
    createBlogCategoryAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Category তৈরি হয়েছে");
      setName("");
      setSlug("");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) setSlug(generateSlug(val));
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteBlogCategoryAction(id);
      if (result.success) {
        toast.success("Category delete হয়েছে");
        setConfirmId(null);
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
      {/* Create form */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold text-text-primary text-sm mb-4">
          Add New Category
        </h2>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Name *
            </label>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="যেমন: Guides"
              className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Slug *
            </label>
            <input
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Short description"
              className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Color
              </label>
              <input
                name="color"
                type="color"
                defaultValue="#7C3AED"
                className="w-full h-10 rounded-lg bg-bg-input border border-border cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Sort Order
              </label>
              <input
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={0}
                className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={actionPending}
            className="w-full bg-gradient-primary text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {actionPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Category
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
            <Folder className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <p className="text-text-muted text-sm">কোনো category নেই</p>
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}20` }}
              >
                <Folder className="w-5 h-5" style={{ color: c.color || "#7C3AED" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text-primary text-sm">
                  {c.name}
                </div>
                <div className="text-[10px] text-text-muted font-mono mt-0.5">
                  /{c.slug}
                </div>
              </div>
              <span className="text-xs text-text-muted bg-bg-secondary px-2 py-1 rounded">
                {c.postCount} posts
              </span>
              <button
                onClick={() => setConfirmId(c.id)}
                className="p-2 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
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
                <h3 className="font-bold text-text-primary">
                  Category delete?
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  এই category-র post গুলো category-হীন হয়ে যাবে।
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-border text-text-primary text-sm"
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
    </div>
  );
}