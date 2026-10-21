"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { ImageUpload } from "@/components/ui/image-upload";
import {
  createBlogPostAction,
  updateBlogPostAction,
  type ActionState,
} from "../../actions";
import { generateSlug } from "../../validations";

const initialState: ActionState = { success: false };

export function BlogPostForm({
  mode,
  postId,
  initialData,
  categories,
}: {
  mode: "create" | "edit";
  postId?: string;
  initialData?: any;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage || ""
  );

  const action = postId
    ? updateBlogPostAction.bind(null, postId)
    : createBlogPostAction;

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Success!");
      router.push("/admin/blog");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) setSlug(generateSlug(val));
  };

  const d = initialData;

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden input for featured image */}
      <input type="hidden" name="featuredImage" value={featuredImage} />

      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="space-y-4">
          <Field label="Post Title *" error={state.errors?.title?.[0]}>
            <input
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="যেমন: Free Fire Diamond Top Up Guide"
              className={input()}
            />
          </Field>

          <Field label="Slug *" error={state.errors?.slug?.[0]}>
            <input
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              className={`${input()} font-mono text-sm`}
            />
            <p className="mt-1 text-xs text-text-muted">
              URL: /blog/{slug || "..."}
            </p>
          </Field>

          <Field label="Excerpt (সংক্ষিপ্ত)">
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={d?.excerpt || ""}
              placeholder="Post-এর সংক্ষিপ্ত বিবরণ (max 500 chars)"
              maxLength={500}
              className={`${input()} resize-none`}
            />
          </Field>

          <Field label="Content *" error={state.errors?.content?.[0]}>
            <textarea
              name="content"
              rows={20}
              required
              defaultValue={d?.content || ""}
              placeholder="Blog post-এর content..."
              className={`${input()} resize-none font-mono text-sm`}
            />
            <p className="mt-1 text-xs text-text-muted">
              Markdown বা plain text support করে
            </p>
          </Field>
        </div>
      </Section>

      {/* Media & Category */}
      <Section title="Media & Category">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ✅ Blog Featured Image Upload */}
          <div className="sm:col-span-2">
            <ImageUpload
              label="Featured Image"
              value={featuredImage}
              onChange={(url) => setFeaturedImage(url)}
            />
          </div>

          <Field label="Category">
            <select
              name="categoryId"
              defaultValue={d?.categoryId || ""}
              className={input()}
            >
              <option value="">— Select Category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tags (comma-separated)">
            <input
              name="tags"
              type="text"
              defaultValue={d?.tags?.join(", ") || ""}
              placeholder="free-fire, top-up, guide"
              className={input()}
            />
          </Field>

          <Field label="Read Time (minutes)">
            <input
              name="readTime"
              type="number"
              min={1}
              max={120}
              defaultValue={d?.readTime ?? 5}
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Status */}
      <Section title="Status">
        <div className="space-y-4">
          <Field label="Status">
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={input()}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>

          <Field label="Publish Date (optional)">
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={
                d?.publishedAt
                  ? new Date(d.publishedAt).toISOString().slice(0, 16)
                  : ""
              }
              className={input()}
            />
            <p className="mt-1 text-xs text-text-muted">
              খালি রাখলে publish করার সময় automatically set হবে
            </p>
          </Field>

          {status === "SCHEDULED" && (
            <Field label="Schedule For">
              <input
                name="scheduledFor"
                type="datetime-local"
                defaultValue={
                  d?.scheduledFor
                    ? new Date(d.scheduledFor).toISOString().slice(0, 16)
                    : ""
                }
                className={input()}
              />
            </Field>
          )}

          <Toggle
            name="isFeatured"
            label="Featured (Homepage/Blog-এ prominence)"
            defaultChecked={d?.isFeatured}
          />
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO (optional)">
        <div className="space-y-4">
          <Field label="SEO Title">
            <input
              name="seoTitle"
              type="text"
              defaultValue={d?.seoTitle || ""}
              placeholder="Search result-এ যে title দেখাবে"
              className={input()}
            />
          </Field>
          <Field label="SEO Description">
            <textarea
              name="seoDescription"
              rows={2}
              defaultValue={d?.seoDescription || ""}
              className={`${input()} resize-none`}
            />
          </Field>
          <Field label="SEO Keywords">
            <input
              name="seoKeywords"
              type="text"
              defaultValue={d?.seoKeywords || ""}
              placeholder="keyword1, keyword2"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Submit */}
      <div className="flex items-center gap-3 sticky bottom-4 bg-bg-card border border-border rounded-xl p-4 z-10">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Post"
              : "Update Post"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-border hover:bg-bg-secondary transition text-text-primary font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function input() {
  return "w-full px-4 py-2.5 rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary transition";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-base font-bold text-text-primary mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 text-primary rounded"
      />
      <span className="text-sm text-text-primary">{label}</span>
    </label>
  );
}