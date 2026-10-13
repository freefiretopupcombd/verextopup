"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

import {
  createHomepageSectionAction,
  updateHomepageSectionAction,
  type HomepageActionState,
} from "../../actions";
import {
  LAYOUT_TYPES,
  LAYOUT_LABELS,
  LAYOUT_DESCRIPTIONS,
  SOURCE_TYPES,
  SOURCE_LABELS,
  SOURCE_DESCRIPTIONS,
} from "../../types";
import { ProductPicker } from "./product-picker";

type Category = {
  id: string;
  name: string;
};

type InitialData = {
  id?: string;
  title: string;
  subtitle: string | null;
  layoutType: string;
  sourceType: string;
  sourceData: { categoryId?: string } | null;
  itemLimit: number;
  mobileColumns?: number;
  desktopColumns?: number;
  isActive: boolean;
  sortOrder: number;
  viewAllUrl: string | null;
  viewAllText: string;
  selectedProducts?: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    icon: string | null;
    price: number;
    salePrice: number | null;
    currency: string;
    status: string;
  }[];
};

const initialState: HomepageActionState = { success: false };

export function SectionForm({
  mode,
  sectionId,
  initialData,
  categories,
  searchProductsAction,
}: {
  mode: "create" | "edit";
  sectionId?: string;
  initialData?: InitialData;
  categories: Category[];
  searchProductsAction: (query: string) => Promise<any[]>;
}) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState(
    initialData?.sourceType || "MANUAL"
  );
  const [layoutType, setLayoutType] = useState(
    initialData?.layoutType || "GRID"
  );
  const [mobileColumns, setMobileColumns] = useState<number>(
    initialData?.mobileColumns ?? 2
  );
  const [desktopColumns, setDesktopColumns] = useState<number>(
    initialData?.desktopColumns ?? 4
  );
  const [selectedProducts, setSelectedProducts] = useState<any[]>(
    initialData?.selectedProducts || []
  );

  const [state, formAction, isPending] = useActionState(
    sectionId
      ? updateHomepageSectionAction.bind(null, sectionId)
      : createHomepageSectionAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Saved!");
      router.push("/admin/homepage");
      router.refresh();
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  // Debug log to console
  useEffect(() => {
    console.log("[SECTION FORM] Initial values:", {
      mode,
      mobileColumns: initialData?.mobileColumns,
      desktopColumns: initialData?.desktopColumns,
      currentMobile: mobileColumns,
      currentDesktop: desktopColumns,
    });
  }, [mode, initialData, mobileColumns, desktopColumns]);

  const d = initialData;

  return (
    <form action={formAction} className="space-y-5">
      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Section Title *" error={state.errors?.title?.[0]}>
            <input
              name="title"
              required
              maxLength={100}
              defaultValue={d?.title || ""}
              placeholder="Popular Products"
              className={input()}
            />
          </Field>

          <Field label="Subtitle (optional)" error={state.errors?.subtitle?.[0]}>
            <input
              name="subtitle"
              maxLength={300}
              defaultValue={d?.subtitle || ""}
              placeholder="Choose a category and explore our top products."
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Product Source */}
      <Section title="Product Source">
        <Field label="Source Type *" error={state.errors?.sourceType?.[0]}>
          <select
            name="sourceType"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className={input()}
          >
            {SOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SOURCE_LABELS[type]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-text-muted">
            {SOURCE_DESCRIPTIONS[sourceType as keyof typeof SOURCE_DESCRIPTIONS]}
          </p>
        </Field>

        {sourceType === "CATEGORY" && (
          <Field
            label="Select Category *"
            error={state.errors?.sourceCategoryId?.[0]}
            className="mt-4"
          >
            <select
              name="sourceCategoryId"
              defaultValue={d?.sourceData?.categoryId || ""}
              className={input()}
            >
              <option value="">— Category select করুন —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        {sourceType === "MANUAL" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select Products *
            </label>
            {state.errors?.productIds?.[0] && (
              <p className="text-xs text-danger mb-2">
                {state.errors.productIds[0]}
              </p>
            )}
            <ProductPicker
              selected={selectedProducts}
              onChange={setSelectedProducts}
              searchAction={searchProductsAction}
            />
          </div>
        )}
      </Section>

      {/* Layout */}
      <Section title="Layout">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LAYOUT_TYPES.map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => setLayoutType(layout)}
              className={`p-4 rounded-lg border-2 text-left transition ${
                layoutType === layout
                  ? "border-primary bg-primary/10"
                  : "border-border bg-bg-secondary hover:border-primary/40"
              }`}
            >
              <div className="font-semibold text-sm text-text-primary mb-1">
                {LAYOUT_LABELS[layout]}
              </div>
              <div className="text-xs text-text-muted">
                {LAYOUT_DESCRIPTIONS[layout]}
              </div>
            </button>
          ))}
        </div>

        <input type="hidden" name="layoutType" value={layoutType} />

        {/* Column Controls — CONTROLLED */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Field
            label="Mobile Columns *"
            error={state.errors?.mobileColumns?.[0]}
            hint="মোবাইলে প্রতি row তে কয়টা (১-৩)"
          >
            <select
              name="mobileColumns"
              value={mobileColumns}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                console.log("[FORM] Mobile columns changed to:", val);
                setMobileColumns(val);
              }}
              className={input()}
            >
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
            </select>
          </Field>

          <Field
            label="Desktop Columns *"
            error={state.errors?.desktopColumns?.[0]}
            hint="ডেস্কটপে প্রতি row তে কয়টা (২-৬)"
          >
            <select
              name="desktopColumns"
              value={desktopColumns}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                console.log("[FORM] Desktop columns changed to:", val);
                setDesktopColumns(val);
              }}
              className={input()}
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
              <option value="5">5 Columns</option>
              <option value="6">6 Columns</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Field label="Items to Show *" error={state.errors?.itemLimit?.[0]}>
            <input
              name="itemLimit"
              type="number"
              min={1}
              max={24}
              defaultValue={d?.itemLimit ?? 8}
              className={input()}
            />
          </Field>

          <Field label="Sort Order">
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

      {/* View All */}
      <Section title="View All Link (optional)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="URL" error={state.errors?.viewAllUrl?.[0]}>
            <input
              name="viewAllUrl"
              defaultValue={d?.viewAllUrl || ""}
              placeholder="/games"
              className={input()}
            />
          </Field>

          <Field label="Button Text">
            <input
              name="viewAllText"
              maxLength={40}
              defaultValue={d?.viewAllText || "View All"}
              placeholder="View All"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Status */}
      <Section title="Status">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={d?.isActive ?? true}
            className="w-4 h-4 text-primary rounded"
          />
          <span className="text-sm text-text-primary">
            Active (homepage এ দেখাবে)
          </span>
        </label>
      </Section>

      {/* Actions */}
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
              ? "Create Section"
              : "Update Section"}
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
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
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
  className = "",
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
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