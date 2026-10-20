"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

import {
  createHeroSlideAction,
  updateHeroSlideAction,
  type HeroActionState,
} from "../../actions";
import {
  BADGE_ICONS,
  CTA_ICONS,
  BUTTON_STYLES,
} from "../../validations";

type SlideInput = {
  title: string;
  subtitle: string | null;
  description: string | null;
  badgeText: string | null;
  badgeIcon: string | null;
  image: string;
  imageMobile: string | null;
  button1Text: string | null;
  button1Url: string | null;
  button1Icon: string | null;
  button1Style: string;
  button2Text: string | null;
  button2Url: string | null;
  button2Icon: string | null;
  overlayColor: string;
  overlayOpacity: number;
  textColor: string;
  accentColor: string;
  isActive: boolean;
  sortOrder: number;
  openInNewTab: boolean;
  startAt: Date | null;
  endAt: Date | null;
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
      {/* ==================
          Section: Content
          ================== */}
      <Section title="Content" subtitle="Slide এর মূল text">
        <Field label="Title *" error={state.errors?.title?.[0]}>
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={d?.title || ""}
            placeholder="Your One Stop Game Top-Up"
            className={input()}
          />
        </Field>

        <Field label="Subtitle" error={state.errors?.subtitle?.[0]}>
          <input
            name="subtitle"
            maxLength={200}
            defaultValue={d?.subtitle || ""}
            placeholder="Get your favorite game credits..."
            className={input()}
          />
        </Field>

        <Field
          label="Description (optional)"
          error={state.errors?.description?.[0]}
        >
          <textarea
            name="description"
            rows={2}
            maxLength={500}
            defaultValue={d?.description || ""}
            placeholder="Extra supporting text..."
            className={`${input()} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Badge Text" error={state.errors?.badgeText?.[0]}>
            <input
              name="badgeText"
              maxLength={60}
              defaultValue={d?.badgeText || ""}
              placeholder="Bangladesh's #1 Platform"
              className={input()}
            />
          </Field>

          <Field label="Badge Icon">
            <select
              name="badgeIcon"
              defaultValue={d?.badgeIcon || ""}
              className={input()}
            >
              <option value="">— None —</option>
              {BADGE_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* ==================
          Section: Images
          ================== */}
      <Section
        title="Images"
        subtitle="1200x600px ideal (desktop) • 800x1200px (mobile)"
      >
        <Field label="Background Image URL *" error={state.errors?.image?.[0]}>
          <input
            name="image"
            required
            type="url"
            defaultValue={d?.image || ""}
            placeholder="https://... or /image.jpg"
            className={input()}
          />
        </Field>

        <Field
          label="Mobile Image URL (optional)"
          error={state.errors?.imageMobile?.[0]}
          hint="খালি রাখলে desktop image mobile এ use হবে"
        >
          <input
            name="imageMobile"
            type="url"
            defaultValue={d?.imageMobile || ""}
            placeholder="https://... (mobile-only image)"
            className={input()}
          />
        </Field>
      </Section>

      {/* ==================
          Section: CTA Buttons
          ================== */}
      <Section title="CTA Buttons">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Button 1 Text">
              <input
                name="button1Text"
                maxLength={40}
                defaultValue={d?.button1Text || ""}
                placeholder="Shop Now"
                className={input()}
              />
            </Field>
            <Field label="URL">
              <input
                name="button1Url"
                defaultValue={d?.button1Url || ""}
                placeholder="/games"
                className={input()}
              />
            </Field>
            <Field label="Icon">
              <select
                name="button1Icon"
                defaultValue={d?.button1Icon || ""}
                className={input()}
              >
                <option value="">— None —</option>
                {CTA_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Button 1 Style">
            <select
              name="button1Style"
              defaultValue={d?.button1Style || "primary"}
              className={input()}
            >
              {BUTTON_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </Field>

          <div className="border-t border-border pt-4 mt-4">
            <p className="text-xs text-text-muted mb-3">
              Button 2 (optional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Button 2 Text">
                <input
                  name="button2Text"
                  maxLength={40}
                  defaultValue={d?.button2Text || ""}
                  placeholder="Learn More"
                  className={input()}
                />
              </Field>
              <Field label="URL">
                <input
                  name="button2Url"
                  defaultValue={d?.button2Url || ""}
                  placeholder="/about"
                  className={input()}
                />
              </Field>
              <Field label="Icon">
                <select
                  name="button2Icon"
                  defaultValue={d?.button2Icon || ""}
                  className={input()}
                >
                  <option value="">— None —</option>
                  {CTA_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>
      </Section>

      {/* ==================
          Section: Colors
          ================== */}
      <Section title="Colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Overlay Color">
            <input
              name="overlayColor"
              type="color"
              defaultValue={d?.overlayColor || "#000000"}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </Field>

          <Field label="Overlay Opacity (0-100)">
            <input
              name="overlayOpacity"
              type="number"
              min={0}
              max={100}
              defaultValue={d?.overlayOpacity ?? 60}
              className={input()}
            />
          </Field>

          <Field label="Text Color">
            <input
              name="textColor"
              type="color"
              defaultValue={d?.textColor || "#FFFFFF"}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </Field>

          <Field label="Accent Color (buttons/badges)">
            <input
              name="accentColor"
              type="color"
              defaultValue={d?.accentColor || "#7C3AED"}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </Field>
        </div>
      </Section>

      {/* ==================
          Section: Schedule
          ================== */}
      <Section
        title="Schedule (optional)"
        subtitle="খালি রাখলে slide always active থাকবে"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Start Date/Time">
            <input
              name="startAt"
              type="datetime-local"
              defaultValue={
                d?.startAt
                  ? new Date(d.startAt).toISOString().slice(0, 16)
                  : ""
              }
              className={input()}
            />
          </Field>

          <Field label="End Date/Time">
            <input
              name="endAt"
              type="datetime-local"
              defaultValue={
                d?.endAt
                  ? new Date(d.endAt).toISOString().slice(0, 16)
                  : ""
              }
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* ==================
          Section: Behavior
          ================== */}
      <Section title="Behavior">
        <div className="space-y-3">
          <Toggle
            name="isActive"
            label="Active (homepage এ দেখাবে)"
            defaultChecked={d?.isActive ?? true}
          />
          <Toggle
            name="openInNewTab"
            label="Links new tab এ খুলবে"
            defaultChecked={d?.openInNewTab ?? false}
          />

          <Field label="Sort Order" hint="ছোট number = আগে দেখাবে">
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={d?.sortOrder ?? 0}
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* ==================
          Action buttons
          ================== */}
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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-xs text-text-muted mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
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