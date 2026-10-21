"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

import {
  createProductAction,
  updateProductAction,
  type ActionState,
} from "../actions";
import {
  generateSlug,
  SEO_LIMITS,
  getCharStatus,
  TWITTER_CARD_TYPES,
  BADGE_ICONS,
} from "../validations";
import { VariationBuilder, type Variation } from "./variation-builder";
import { FieldBuilder, type ProductField } from "./field-builder";

type Category = { id: string; name: string };

type InitialData = {
  name: string;
  slug: string;
  sku?: string | null;
  categoryId?: string | null;
  brand?: string | null;
  productType: string;
  shortDesc?: string | null;
  fullDesc?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  price: number;
  currency: string;
  status: string;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  deliveryType: string;
  checkoutMode: string;
  instructions?: string | null;
  terms?: string | null;

  // SEO — Core
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  canonicalUrl?: string | null;

  // SEO — Extended (2026)
  primaryKeyword?: string | null;
  secondaryKeywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCard?: string | null;
  twitterImage?: string | null;
  isIndexable: boolean;
  isFollowable: boolean;
  breadcrumbLabel?: string | null;

  // Badges
  badge1Text?: string | null;
  badge1Icon?: string | null;
  badge1Color?: string | null;
  badge2Text?: string | null;
  badge2Icon?: string | null;
  badge2Color?: string | null;
  badge3Text?: string | null;
  badge3Icon?: string | null;
  badge3Color?: string | null;

  variations: Variation[];
  fields: ProductField[];
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initialData?: InitialData;
  categories: Category[];
};

const initialState: ActionState = { success: false };

export function ProductForm({
  mode,
  productId,
  initialData,
  categories,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [variations, setVariations] = useState<Variation[]>(
    initialData?.variations || []
  );
  const [fields, setFields] = useState<ProductField[]>(
    initialData?.fields || []
  );

  // SEO live character counters
  const [seoTitleLen, setSeoTitleLen] = useState(
    initialData?.seoTitle?.length || 0
  );
  const [seoDescLen, setSeoDescLen] = useState(
    initialData?.seoDescription?.length || 0
  );

  const action = productId
    ? updateProductAction.bind(null, productId)
    : createProductAction;

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Success!");
      router.push("/admin/products");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) setSlug(generateSlug(val));
  };

  const d = initialData;

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="variations"
        value={JSON.stringify(variations)}
      />
      <input type="hidden" name="fields" value={JSON.stringify(fields)} />

      {/* ============ Basic ============ */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Product নাম *"
            error={state.errors?.name?.[0]}
            className="sm:col-span-2"
          >
            <input
              name="name"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="যেমন: Free Fire Diamonds"
              className={input()}
            />
          </Field>

          <Field label="Slug *" error={state.errors?.slug?.[0]}>
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              className={`${input()} font-mono text-sm`}
            />
          </Field>

          <Field label="SKU prefix (ঐচ্ছিক)" error={state.errors?.sku?.[0]}>
            <input
              name="sku"
              defaultValue={d?.sku || ""}
              placeholder="FF"
              className={`${input()} font-mono text-sm`}
            />
          </Field>

          <Field label="Category">
            <select
              name="categoryId"
              defaultValue={d?.categoryId || ""}
              className={input()}
            >
              <option value="">— Select —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Brand (ঐচ্ছিক)">
            <input
              name="brand"
              defaultValue={d?.brand || ""}
              placeholder="Garena"
              className={input()}
            />
          </Field>

          <Field label="Product Type *">
            <select
              name="productType"
              defaultValue={d?.productType || "TOPUP"}
              className={input()}
            >
              <option value="TOPUP">Top-Up</option>
              <option value="GIFT_CARD">Gift Card</option>
              <option value="SUBSCRIPTION">Subscription</option>
              <option value="SERVICE">Service</option>
            </select>
          </Field>

          <Field label="Checkout Mode">
            <select
              name="checkoutMode"
              defaultValue={d?.checkoutMode || "DIRECT"}
              className={input()}
            >
              <option value="DIRECT">Direct Checkout</option>
              <option value="CART">Add to Cart</option>
              <option value="BOTH">Both</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* ============ Description ============ */}
      <Section title="Description">
        <div className="space-y-4">
          <Field label="Short Description">
            <textarea
              name="shortDesc"
              rows={2}
              defaultValue={d?.shortDesc || ""}
              placeholder="সংক্ষিপ্ত বিবরণ"
              className={`${input()} resize-none`}
            />
          </Field>
          <Field label="Full Description">
            <textarea
              name="fullDesc"
              rows={6}
              defaultValue={d?.fullDesc || ""}
              placeholder="বিস্তারিত বিবরণ"
              className={`${input()} resize-none`}
            />
          </Field>
        </div>
      </Section>

      {/* ============ Images ============ */}
      <Section title="Images">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Thumbnail Image">
  <input
    type="hidden"
    name="thumbnail"
    value={d?.thumbnail || ""}
    onChange={() => {}} // Optional: Keep hidden input for form submission if needed
  />
  <ImageUpload
    value={d?.thumbnail || ""}
    onChange={(url) => {
      // Update hidden input value
      const input = document.querySelector('input[name="thumbnail"]') as HTMLInputElement;
      if (input) input.value = url;
    }}
  />
</Field>
          <Field label="Product Icon (emoji)">
            <input
              name="icon"
              defaultValue={d?.icon || ""}
              placeholder="💎"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* ============ Variations ============ */}
      <Section
        title="Variations *"
        subtitle="প্রতিটি product-এর multiple variation থাকবে (যেমন: 100 Diamonds, 310 Diamonds)"
      >
        <VariationBuilder variations={variations} onChange={setVariations} />
        {variations.length === 0 && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-text-primary">
              কমপক্ষে ১টা variation যোগ করা বাধ্যতামূলক।
            </p>
          </div>
        )}
      </Section>

      {/* ============ Customer Fields ============ */}
      <Section
        title="Customer Input Fields"
        subtitle="Order করার সময় customer-এর কাছ থেকে কী তথ্য নেবেন (Player ID, Server, ইত্যাদি)"
      >
        <FieldBuilder fields={fields} onChange={setFields} />
      </Section>

      {/* ============ Base Price ============ */}
      <Section title="Base Price (display only)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Base Price (৳)">
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={d?.price ?? 0}
              className={input()}
            />
          </Field>
          <Field label="Currency">
            <input
              name="currency"
              defaultValue={d?.currency || "BDT"}
              disabled
              className={`${input()} bg-bg-secondary cursor-not-allowed`}
            />
          </Field>
        </div>
      </Section>

      {/* ============ Delivery ============ */}
      <Section title="Delivery">
        <Field label="Delivery Type">
          <select
            name="deliveryType"
            defaultValue={d?.deliveryType || "MANUAL"}
            className={input()}
          >
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatic (API)</option>
          </select>
        </Field>
      </Section>

      {/* ============ Flags ============ */}
      <Section title="Display Flags">
        <div className="space-y-3">
          <Toggle
            name="isFeatured"
            label="Featured (homepage-এ দেখান)"
            defaultChecked={d?.isFeatured}
          />
          <Toggle
            name="isPopular"
            label="Popular"
            defaultChecked={d?.isPopular}
          />
          <Toggle name="isNew" label="New" defaultChecked={d?.isNew ?? true} />
        </div>
      </Section>

      {/* ============ Status ============ */}
      <Section title="Status">
        <Field label="Product Status">
          <select
            name="status"
            defaultValue={d?.status || "DRAFT"}
            className={input()}
          >
            <option value="DRAFT">Draft (লুকানো)</option>
            <option value="ACTIVE">Active (published)</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </Field>
      </Section>
      
                  {/* ============ Dynamic Badges ============ */}
      <Section
        title="Product Badges"
        subtitle="Product-এর নিচে ৩টা পর্যন্ত badge দেখাতে পারেন — text + icon + color সব admin control"
      >
        <div className="space-y-4">
          {[1, 2, 3].map((num) => {
            const textKey = `badge${num}Text` as keyof InitialData;
            const iconKey = `badge${num}Icon` as keyof InitialData;
            const colorKey = `badge${num}Color` as keyof InitialData;

            const currentText = (d?.[textKey] as string) || "";
            const currentIcon = (d?.[iconKey] as string) || "";
            const currentColor = (d?.[colorKey] as string) || "";

            return (
              <div
                key={num}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-bg-secondary border border-border"
              >
                <Field label={`Badge ${num} — Icon`}>
                  <select
                    name={`badge${num}Icon`}
                    defaultValue={currentIcon}
                    className={input()}
                  >
                    <option value="">— No icon —</option>
                    {BADGE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={`Badge ${num} — Text`}>
                  <input
                    name={`badge${num}Text`}
                    maxLength={20}
                    defaultValue={currentText}
                    placeholder="যেমন: Instant"
                    className={input()}
                  />
                </Field>

                <Field label={`Badge ${num} — Color`}>
                  <select
                    name={`badge${num}Color`}
                    defaultValue={currentColor}
                    className={input()}
                  >
                    <option value="">— No color —</option>
                    <option value="primary">Primary (Purple)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="danger">Danger (Red)</option>
                    <option value="info">Info (Blue)</option>
                    <option value="neutral">Neutral (Gray)</option>
                  </select>
                </Field>
              </div>
            );
          })}

          <p className="text-xs text-text-muted">
            💡 টিপ: খালি রাখলে default badges (Instant, Region, Verified)
            দেখাবে। কিছু লিখলে সেটাই দেখাবে।
          </p>
        </div>
      </Section>



      {/* ============ Instructions & Terms ============ */}
      <Section title="Instructions & Terms">
        <div className="space-y-4">
          <Field label="Instructions">
            <textarea
              name="instructions"
              rows={4}
              defaultValue={d?.instructions || ""}
              placeholder="কীভাবে order করবেন..."
              className={`${input()} resize-none`}
            />
          </Field>
          <Field label="Terms & Conditions">
            <textarea
              name="terms"
              rows={4}
              defaultValue={d?.terms || ""}
              placeholder="শর্তাবলী..."
              className={`${input()} resize-none`}
            />
          </Field>
        </div>
      </Section>

      {/* ============================================
          SEO — CORE
          ============================================ */}
      <Section
        title="SEO — Core"
        subtitle="Google search result এ যা দেখা যাবে"
      >
        <div className="space-y-4">
          {/* SEO Title with live counter */}
          <Field
            label="SEO Title"
            error={state.errors?.seoTitle?.[0]}
          >
            <input
              name="seoTitle"
              maxLength={SEO_LIMITS.TITLE_MAX}
              defaultValue={d?.seoTitle || ""}
              onChange={(e) => setSeoTitleLen(e.target.value.length)}
              placeholder={`যেমন: Free Fire Diamond Top Up Bangladesh — Instant Delivery`}
              className={input()}
            />
            <CharCounter
              current={seoTitleLen}
              max={SEO_LIMITS.TITLE_MAX}
              hint={`Google SERP এ ${SEO_LIMITS.TITLE_MAX} char পর্যন্ত দেখায়`}
            />
          </Field>

          {/* SEO Description */}
          <Field
            label="SEO Description"
            error={state.errors?.seoDescription?.[0]}
          >
            <textarea
              name="seoDescription"
              rows={3}
              maxLength={SEO_LIMITS.DESC_MAX}
              defaultValue={d?.seoDescription || ""}
              onChange={(e) => setSeoDescLen(e.target.value.length)}
              placeholder="Free Fire diamond কিনুন সবচেয়ে কম দামে, instant delivery সহ। ১০০% safe, ২৪/৭ support।"
              className={`${input()} resize-none`}
            />
            <CharCounter
              current={seoDescLen}
              max={SEO_LIMITS.DESC_MAX}
              hint={`Google SERP এ ${SEO_LIMITS.DESC_MAX} char পর্যন্ত দেখায়`}
            />
          </Field>

          {/* Keywords */}
          <Field
            label="SEO Keywords"
            error={state.errors?.seoKeywords?.[0]}
          >
            <input
              name="seoKeywords"
              defaultValue={d?.seoKeywords || ""}
              placeholder="free fire diamond, ff top up bd, free fire uc"
              className={input()}
            />
            <p className="mt-1 text-xs text-text-muted">
              কমা দিয়ে আলাদা করুন। এটি Google এখন কম গুরুত্ব দেয়, তবে internal reference এ কাজে লাগে।
            </p>
          </Field>

          {/* Canonical */}
          <Field
            label="Canonical URL (ঐচ্ছিক)"
            error={state.errors?.canonicalUrl?.[0]}
          >
            <input
              name="canonicalUrl"
              type="url"
              defaultValue={d?.canonicalUrl || ""}
              placeholder="https://verextopup.com/products/free-fire-bd"
              className={`${input()} font-mono text-sm`}
            />
            <p className="mt-1 text-xs text-text-muted">
              খালি রাখলে auto-generate হবে। Duplicate content থাকলে এখানে original URL দিন।
            </p>
          </Field>
        </div>
      </Section>

      {/* ============================================
          SEO — ADVANCED (2026)
          ============================================ */}
      <Section
        title="SEO — Advanced (2026)"
        subtitle="Google AI Overviews, social sharing, এবং indexing control"
      >
        <div className="space-y-4">
          {/* Primary Keyword */}
          <Field
            label="Primary Keyword"
            error={state.errors?.primaryKeyword?.[0]}
          >
            <input
              name="primaryKeyword"
              defaultValue={d?.primaryKeyword || ""}
              placeholder="free fire diamond top up"
              className={input()}
            />
            <p className="mt-1 text-xs text-text-muted">
              এই page-এর মূল target keyword (একটি মাত্র)। SEO score calculation ও internal linking এ ব্যবহার হবে।
            </p>
          </Field>

          {/* Secondary Keywords */}
          <Field label="Secondary Keywords">
            <input
              name="secondaryKeywords"
              defaultValue={d?.secondaryKeywords || ""}
              placeholder="ff top up bd, free fire uc, garena diamond"
              className={input()}
            />
            <p className="mt-1 text-xs text-text-muted">
              কমা দিয়ে আলাদা। Primary keyword এর synonyms/variations।
            </p>
          </Field>

          {/* Breadcrumb Label */}
          <Field label="Breadcrumb Label (ঐচ্ছিক)">
            <input
              name="breadcrumbLabel"
              defaultValue={d?.breadcrumbLabel || ""}
              placeholder="Free Fire Diamond"
              className={input()}
            />
            <p className="mt-1 text-xs text-text-muted">
              খালি রাখলে product name ব্যবহার হবে। Breadcrumb এ ছোট নাম চাইলে এখানে দিন।
            </p>
          </Field>

          {/* Open Graph */}
          <div className="pt-4 mt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Social Sharing (Open Graph / Twitter)
            </h4>

            <div className="space-y-4">
              <Field label="OG Title (ঐচ্ছিক)">
                <input
                  name="ogTitle"
                  maxLength={SEO_LIMITS.TITLE_MAX}
                  defaultValue={d?.ogTitle || ""}
                  placeholder="খালি রাখলে SEO Title ব্যবহার হবে"
                  className={input()}
                />
              </Field>

              <Field label="OG Description (ঐচ্ছিক)">
                <textarea
                  name="ogDescription"
                  rows={2}
                  maxLength={SEO_LIMITS.DESC_MAX}
                  defaultValue={d?.ogDescription || ""}
                  placeholder="খালি রাখলে SEO Description ব্যবহার হবে"
                  className={`${input()} resize-none`}
                />
              </Field>

              <Field label="OG Image URL (ঐচ্ছিক)">
                <input
                  name="ogImage"
                  type="url"
                  defaultValue={d?.ogImage || ""}
                  placeholder="https://... (1200x630 ideal)"
                  className={input()}
                />
                <p className="mt-1 text-xs text-text-muted">
                  Facebook/WhatsApp এ share করলে এই image দেখাবে। Ideal size: 1200x630px।
                </p>
              </Field>

              <Field label="Twitter Card Type">
                <select
                  name="twitterCard"
                  defaultValue={d?.twitterCard || "summary_large_image"}
                  className={input()}
                >
                  {TWITTER_CARD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Twitter Image URL (ঐচ্ছিক)">
                <input
                  name="twitterImage"
                  type="url"
                  defaultValue={d?.twitterImage || ""}
                  placeholder="খালি রাখলে OG Image ব্যবহার হবে"
                  className={input()}
                />
              </Field>
            </div>
          </div>

          {/* Indexing Control */}
          <div className="pt-4 mt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Search Engine Indexing
            </h4>

            <div className="space-y-3">
              <Toggle
                name="isIndexable"
                label="Search engine-এ index করুন (Google এ দেখাবে)"
                defaultChecked={d?.isIndexable ?? true}
              />

              <Toggle
                name="isFollowable"
                label="Link follow করুন (backlink value দেবে)"
                defaultChecked={d?.isFollowable ?? true}
              />

              <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
                <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
                <p className="text-xs text-text-primary">
                  <strong>Noindex করলে</strong> এই product Google search এ দেখাবে না, কিন্তু direct link দিয়ে কেউ access করতে পারবে। শুধু अस्थायीভাবে লুকাতে চাইলে ব্যবহার করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ============ Submit ============ */}
      <div className="flex items-center gap-3 sticky bottom-4 bg-bg-card border border-border rounded-xl p-4 z-10">
        <button
          type="submit"
          disabled={isPending || variations.length === 0}
          className="bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-60"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Update Product"}
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

// ==================================================
// HELPER COMPONENTS
// ==================================================

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
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      {subtitle && (
        <p className="text-xs text-text-muted mt-1 mb-4">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
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

// ==================================================
// CHARACTER COUNTER (with color coding)
// ==================================================
function CharCounter({
  current,
  max,
  hint,
}: {
  current: number;
  max: number;
  hint?: string;
}) {
  const status = getCharStatus(current, max);
  const colors = {
    empty: "text-text-muted",
    good: "text-success",
    warn: "text-warning",
    over: "text-danger",
  };

  return (
    <div className="mt-1 flex items-center justify-between gap-2">
      <p className="text-xs text-text-muted">{hint}</p>
      <span className={`text-xs font-mono ${colors[status]}`}>
        {current} / {max}
      </span>
    </div>
  );
}