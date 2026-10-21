"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createCategoryAction,
  updateCategoryAction,
  type ActionState,
} from "../actions";
import { generateSlug } from "../validations";

type CategoryFormProps = {
  mode: "create" | "edit";
  categoryId?: string;
  initialData?: {
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    icon?: string | null;
    parentId?: string | null;
    sortOrder: number;
    status: string;
    isFeatured: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
  };
  categories: { id: string; name: string }[];
};

const initialState: ActionState = { success: false };

export function CategoryForm({
  mode,
  categoryId,
  initialData,
  categories,
}: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [image, setImage] = useState(initialData?.image || "");

  const action = categoryId
    ? updateCategoryAction.bind(null, categoryId)
    : createCategoryAction;

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Success!");
      router.push("/admin/categories");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(generateSlug(val));
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden input for image */}
      <input type="hidden" name="image" value={image} />

      {/* Basic Information */}
      <div className="bg-card rounded-xl shadow-card border border-border p-6">
        <h3 className="text-lg font-bold text-content mb-4">
          Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              Category নাম *
            </label>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="যেমন: Free Fire, PUBG Mobile"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {state.errors?.name && (
              <p className="mt-1.5 text-sm text-error">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
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
              placeholder="free-fire"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1.5 text-xs text-content-muted">
              URL-এ দেখাবে: /categories/{slug || "..."}
            </p>
            {state.errors?.slug && (
              <p className="mt-1.5 text-sm text-error">
                {state.errors.slug[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialData?.description || ""}
              placeholder="Category-র সংক্ষিপ্ত বিবরণ"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              Parent Category (ঐচ্ছিক)
            </label>
            <select
              name="parentId"
              defaultValue={initialData?.parentId || ""}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">— কোনো parent নেই (Top-level) —</option>
              {categories
                .filter((c) => c.id !== categoryId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-card rounded-xl shadow-card border border-border p-6">
        <h3 className="text-lg font-bold text-content mb-4">
          Display Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              Icon (emoji বা icon name)
            </label>
            <input
              name="icon"
              type="text"
              defaultValue={initialData?.icon || ""}
              placeholder="🎮 / gamepad"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              Sort Order
            </label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={initialData?.sortOrder || 0}
              min={0}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* ✅ Category Image Upload */}
          <div className="sm:col-span-2">
            <ImageUpload
              label="Category Image (ঐচ্ছিক)"
              value={image}
              onChange={(url) => setImage(url)}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-card rounded-xl shadow-card border border-border p-6">
        <h3 className="text-lg font-bold text-content mb-4">Status</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={initialData?.isFeatured || false}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
            />
            <span className="text-sm text-content">
              Homepage-এ Featured হিসেবে দেখান
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              Visibility
            </label>
            <select
              name="status"
              defaultValue={initialData?.status || "ACTIVE"}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="ACTIVE">Active (দৃশ্যমান)</option>
              <option value="INACTIVE">Inactive (লুকানো)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-card rounded-xl shadow-card border border-border p-6">
        <h3 className="text-lg font-bold text-content mb-4">
          SEO (ঐচ্ছিক)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              SEO Title
            </label>
            <input
              name="seoTitle"
              type="text"
              defaultValue={initialData?.seoTitle || ""}
              placeholder="Search result-এ যে title দেখাবে"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              SEO Description
            </label>
            <textarea
              name="seoDescription"
              rows={2}
              defaultValue={initialData?.seoDescription || ""}
              placeholder="Meta description (max 160 char recommended)"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content mb-1.5">
              SEO Keywords
            </label>
            <input
              name="seoKeywords"
              type="text"
              defaultValue={initialData?.seoKeywords || ""}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Category"
              : "Update Category"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-border hover:bg-muted transition text-content font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}