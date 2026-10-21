"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { ImageUpload } from "@/components/ui/image-upload";
import {
  createHeroSlideAction,
  updateHeroSlideAction,
  type HeroActionState,
} from "../../actions";

type SlideInput = {
  image: string;
  imageMobile: string | null;
  isActive: boolean;
  sortOrder: number;
};

const initialState: HeroActionState = { success: false };

export function HeroSlideForm({
  mode,
  slideId,
  initialData,
}: {
  mode: "create" | "edit";
  slideId?: string;
  initialData?: SlideInput;
}) {
  const router = useRouter();
  const [image, setImage] = useState(initialData?.image || "");
  const [imageMobile, setImageMobile] = useState(
    initialData?.imageMobile || ""
  );

  const [state, formAction, isPending] = useActionState(
    slideId
      ? updateHeroSlideAction.bind(null, slideId)
      : createHeroSlideAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Saved!");
      router.push("/admin/hero-slider");
      router.refresh();
    }
  }, [state, router]);

  const d = initialData;

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden inputs */}
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="imageMobile" value={imageMobile} />

      {/* Images Section */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-text-primary">Slider Image</h3>
        </div>

        {/* ✅ Desktop Image Upload */}
        <Field label="Desktop Image *" error={state.errors?.image?.[0]}>
          <ImageUpload
            label="Upload Desktop Image"
            value={image}
            onChange={(url) => setImage(url)}
          />
          <p className="mt-1 text-xs text-text-muted">
            Recommended: 1920x600px (landscape)
          </p>
        </Field>

        {/* ✅ Mobile Image Upload */}
        <Field
          label="Mobile Image (Optional)"
          error={state.errors?.imageMobile?.[0]}
          hint="খালি রাখলে ডেস্কটপ ইমেজ মোবাইলেও দেখাবে"
        >
          <ImageUpload
            label="Upload Mobile Image"
            value={imageMobile}
            onChange={(url) => setImageMobile(url)}
          />
        </Field>
      </div>

      {/* Settings Section */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold text-text-primary">Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Sort Order" hint="ছোট number = আগে দেখাবে">
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={d?.sortOrder ?? 0}
              className={input()}
            />
          </Field>

          <div className="flex items-center pt-6">
            <Toggle
              name="isActive"
              label="Active (homepage এ দেখাবে)"
              defaultChecked={d?.isActive ?? true}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
              ? "Create Slide"
              : "Update Slide"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-border hover:bg-bg-secondary transition text-text-primary font-medium flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}

// ==================
// Helpers
// ==================
function input() {
  return "w-full px-4 py-2.5 rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:border-primary transition";
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-text-muted">{hint}</p>
      )}
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