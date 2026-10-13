"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Building2,
  Mail,
  MapPin,
  Share2,
  Image as ImageIcon,
  BarChart3,
  Shield,
  Settings2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import {
  updateSeoSettingsAction,
  type SeoActionState,
} from "../../actions";
import type { SeoSettings } from "../../types";
import { ORGANIZATION_TYPES } from "../../types";

const initialState: SeoActionState = { success: false };

export function SeoSettingsForm({
  initialData,
}: {
  initialData: SeoSettings;
}) {
  const [state, formAction] = useActionState(
    updateSeoSettingsAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Message */}
      {state.message && (
        <div
          className={`flex items-start gap-2 p-4 rounded-lg border ${
            state.success
              ? "bg-success/10 border-success/20 text-success"
              : "bg-danger/10 border-danger/20 text-danger"
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{state.message}</p>
        </div>
      )}

      {/* Section 1: Site Identity */}
      <Section
        icon={<Globe className="w-5 h-5" />}
        title="Site Identity"
        subtitle="আপনার ওয়েবসাইটের মূল পরিচয়"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Site Name *"
            error={state.errors?.siteName?.[0]}
            hint="Google SERP এ title হিসেবে দেখাবে"
          >
            <input
              name="siteName"
              required
              defaultValue={initialData.siteName}
              placeholder="VerexTopUp"
              className={input()}
            />
          </Field>

          <Field
            label="Site URL *"
            error={state.errors?.siteUrl?.[0]}
            hint="Trailing slash ছাড়া দিন"
          >
            <input
              name="siteUrl"
              type="url"
              required
              defaultValue={initialData.siteUrl}
              placeholder="https://verextopup.com"
              className={input()}
            />
          </Field>

          <Field
            label="Site Tagline"
            error={state.errors?.siteTagline?.[0]}
            hint="Homepage title এ ব্যবহৃত হবে"
            className="sm:col-span-2"
          >
            <input
              name="siteTagline"
              maxLength={100}
              defaultValue={initialData.siteTagline}
              placeholder="Play More, Pay Less"
              className={input()}
            />
          </Field>

          <Field
            label="Site Description"
            error={state.errors?.siteDescription?.[0]}
            hint="Max 300 character। Google SERP এ meta description"
            className="sm:col-span-2"
          >
            <textarea
              name="siteDescription"
              rows={3}
              maxLength={300}
              defaultValue={initialData.siteDescription}
              placeholder="Bangladesh's #1 digital top-up platform..."
              className={`${input()} resize-none`}
            />
          </Field>
        </div>
      </Section>

      {/* Section: Brand Logo Text */}
      <Section
        icon={<Sparkles className="w-5 h-5" />}
        title="Brand Logo Text"
        subtitle="Header এবং Footer এ যে logo text দেখাবে"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Brand Name (Part 1 — Colored)"
            error={state.errors?.brandNamePart1?.[0]}
            hint="Logo এর রঙিন অংশ (যেমন: Verex)"
          >
            <input
              name="brandNamePart1"
              maxLength={30}
              defaultValue={initialData.brandNamePart1}
              placeholder="Verex"
              className={input()}
            />
          </Field>

          <Field
            label="Brand Name (Part 2 — White)"
            error={state.errors?.brandNamePart2?.[0]}
            hint="Logo এর সাদা অংশ (যেমন: TopUp)"
          >
            <input
              name="brandNamePart2"
              maxLength={30}
              defaultValue={initialData.brandNamePart2}
              placeholder="TopUp"
              className={input()}
            />
          </Field>

          <Field
            label="Brand Tagline"
            error={state.errors?.brandTagline?.[0]}
            hint="Logo এর নিচে ছোট text"
            className="sm:col-span-2"
          >
            <input
              name="brandTagline"
              maxLength={80}
              defaultValue={initialData.brandTagline}
              placeholder="Play More, Pay Less"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Section 2: Organization */}
      <Section
        icon={<Building2 className="w-5 h-5" />}
        title="Organization"
        subtitle="Google Knowledge Panel ও brand verification"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Organization Name *"
            error={state.errors?.organizationName?.[0]}
          >
            <input
              name="organizationName"
              required
              defaultValue={initialData.organizationName}
              placeholder="VerexTopUp"
              className={input()}
            />
          </Field>

          <Field
            label="Legal Name (ঐচ্ছিক)"
            error={state.errors?.organizationLegalName?.[0]}
          >
            <input
              name="organizationLegalName"
              defaultValue={initialData.organizationLegalName}
              placeholder="VerexTopUp Ltd."
              className={input()}
            />
          </Field>

          <Field
            label="Organization Logo URL"
            error={state.errors?.organizationLogo?.[0]}
            hint="Square logo ভালো"
          >
            <input
              name="organizationLogo"
              defaultValue={initialData.organizationLogo}
              placeholder="/logo.png"
              className={input()}
            />
          </Field>

          <Field
            label="Organization Type"
            error={state.errors?.organizationType?.[0]}
          >
            <select
              name="organizationType"
              defaultValue={initialData.organizationType}
              className={input()}
            >
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Founding Year" error={state.errors?.foundingYear?.[0]}>
            <input
              name="foundingYear"
              maxLength={4}
              defaultValue={initialData.foundingYear}
              placeholder="2024"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Section 3: Contact */}
      <Section
        icon={<Mail className="w-5 h-5" />}
        title="Contact Information"
        subtitle="Google E-E-A-T signal"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact Email" error={state.errors?.contactEmail?.[0]}>
            <input
              name="contactEmail"
              type="email"
              defaultValue={initialData.contactEmail}
              placeholder="support@verextopup.com"
              className={input()}
            />
          </Field>

          <Field label="Contact Phone" error={state.errors?.contactPhone?.[0]}>
            <input
              name="contactPhone"
              type="tel"
              defaultValue={initialData.contactPhone}
              placeholder="+880 1XXX-XXXXXX"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Section 4: Address */}
      <Section
        icon={<MapPin className="w-5 h-5" />}
        title="Business Address (ঐচ্ছিক)"
        subtitle="Local SEO ও Google Maps এর জন্য"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Street Address" className="sm:col-span-2">
            <input
              name="addressStreet"
              defaultValue={initialData.addressStreet}
              placeholder="123 Main Street"
              className={input()}
            />
          </Field>

          <Field label="City">
            <input
              name="addressCity"
              defaultValue={initialData.addressCity}
              placeholder="Dhaka"
              className={input()}
            />
          </Field>

          <Field label="Region / State">
            <input
              name="addressRegion"
              defaultValue={initialData.addressRegion}
              placeholder="Dhaka Division"
              className={input()}
            />
          </Field>

          <Field label="Postal Code">
            <input
              name="addressPostalCode"
              defaultValue={initialData.addressPostalCode}
              placeholder="1200"
              className={input()}
            />
          </Field>

          <Field label="Country Code" hint="২ অক্ষরের code">
            <input
              name="addressCountry"
              maxLength={2}
              defaultValue={initialData.addressCountry}
              placeholder="BD"
              className={`${input()} uppercase`}
            />
          </Field>
        </div>
      </Section>

      {/* Section 5: Social */}
      <Section
        icon={<Share2 className="w-5 h-5" />}
        title="Social Media Profiles"
        subtitle="Footer এ এই links দেখাবে। খালি রাখলে hide হবে"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Facebook">
            <input
              name="socialFacebook"
              type="url"
              defaultValue={initialData.socialFacebook}
              placeholder="https://facebook.com/yourpage"
              className={input()}
            />
          </Field>

          <Field label="YouTube">
            <input
              name="socialYoutube"
              type="url"
              defaultValue={initialData.socialYoutube}
              placeholder="https://youtube.com/@channel"
              className={input()}
            />
          </Field>

          <Field label="Instagram">
            <input
              name="socialInstagram"
              type="url"
              defaultValue={initialData.socialInstagram}
              placeholder="https://instagram.com/account"
              className={input()}
            />
          </Field>

          <Field label="Twitter / X">
            <input
              name="socialTwitter"
              type="url"
              defaultValue={initialData.socialTwitter}
              placeholder="https://x.com/handle"
              className={input()}
            />
          </Field>

          <Field label="TikTok">
            <input
              name="socialTiktok"
              type="url"
              defaultValue={initialData.socialTiktok}
              placeholder="https://tiktok.com/@account"
              className={input()}
            />
          </Field>

          <Field label="WhatsApp">
            <input
              name="socialWhatsapp"
              type="url"
              defaultValue={initialData.socialWhatsapp}
              placeholder="https://wa.me/8801XXXXXXXXX"
              className={input()}
            />
          </Field>

          <Field label="Telegram">
            <input
              name="socialTelegram"
              type="url"
              defaultValue={initialData.socialTelegram}
              placeholder="https://t.me/channel"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Section 6: OG / Twitter */}
      <Section
        icon={<ImageIcon className="w-5 h-5" />}
        title="Social Sharing (OG / Twitter)"
        subtitle="Facebook, WhatsApp এ share করলে কী দেখাবে"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Default OG Image URL"
            error={state.errors?.defaultOgImage?.[0]}
            hint="1200x630px ideal"
            className="sm:col-span-2"
          >
            <input
              name="defaultOgImage"
              defaultValue={initialData.defaultOgImage}
              placeholder="/og-default.jpg"
              className={input()}
            />
          </Field>

          <Field label="Default Twitter Card Type">
            <select
              name="defaultTwitterCard"
              defaultValue={initialData.defaultTwitterCard}
              className={input()}
            >
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
              <option value="player">player</option>
              <option value="app">app</option>
            </select>
          </Field>

          <Field label="Twitter Handle">
            <input
              name="twitterHandle"
              defaultValue={initialData.twitterHandle}
              placeholder="@verextopup"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Section 7: Analytics */}
      <Section
        icon={<BarChart3 className="w-5 h-5" />}
        title="Analytics"
        subtitle="Google Analytics / GTM"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Google Analytics 4 ID"
            error={state.errors?.analyticsGaId?.[0]}
            hint="Format: G-XXXXXXXXXX"
          >
            <input
              name="analyticsGaId"
              defaultValue={initialData.analyticsGaId}
              placeholder="G-XXXXXXXXXX"
              className={`${input()} font-mono`}
            />
          </Field>

          <Field
            label="Google Tag Manager ID"
            error={state.errors?.analyticsGtmId?.[0]}
            hint="Format: GTM-XXXXXXX"
          >
            <input
              name="analyticsGtmId"
              defaultValue={initialData.analyticsGtmId}
              placeholder="GTM-XXXXXXX"
              className={`${input()} font-mono`}
            />
          </Field>
        </div>
      </Section>

      {/* Section 8: Verification */}
      <Section
        icon={<Shield className="w-5 h-5" />}
        title="Search Engine Verification"
        subtitle="Google Search Console ও Bing"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Google Verification Code">
            <input
              name="verificationGoogle"
              defaultValue={initialData.verificationGoogle}
              placeholder="google-site-verification content"
              className={`${input()} font-mono text-sm`}
            />
          </Field>

          <Field label="Bing Verification Code">
            <input
              name="verificationBing"
              defaultValue={initialData.verificationBing}
              placeholder="msvalidate.01 content"
              className={`${input()} font-mono text-sm`}
            />
          </Field>
        </div>
      </Section>

      {/* Section 9: Advanced */}
      <Section
        icon={<Settings2 className="w-5 h-5" />}
        title="Advanced"
        subtitle="Language, indexing"
      >
        <div className="space-y-4">
          <Toggle
            name="enableIndexing"
            label="Search engine indexing চালু রাখুন"
            description="বন্ধ করলে Google site index করবে না"
            defaultChecked={initialData.enableIndexing}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Primary Locale" hint="Format: en_US, bn_BD">
              <input
                name="primaryLocale"
                defaultValue={initialData.primaryLocale}
                placeholder="en_US"
                className={input()}
              />
            </Field>

            <Field label="Alternate Locales" hint='JSON: ["bn_BD"]'>
              <input
                name="alternateLocales"
                defaultValue={JSON.stringify(initialData.alternateLocales)}
                placeholder='["bn_BD"]'
                className={`${input()} font-mono text-sm`}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3 sticky bottom-4 bg-bg-card border border-border rounded-xl p-4 z-10">
        <SubmitButton />
        <ResetButton />
      </div>
    </form>
  );
}

// ==================================================
// SUBMIT
// ==================================================
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-60"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? "Saving..." : "Save SEO Settings"}
    </button>
  );
}

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        if (!confirm("সব SEO settings মুছে default এ ফিরে যাবে। নিশ্চিত?")) {
          e.preventDefault();
        }
      }}
      className="px-6 py-3 rounded-lg border border-border hover:bg-bg-secondary transition text-text-primary font-medium flex items-center gap-2 disabled:opacity-60"
    >
      <RotateCcw className="w-4 h-4" />
      Reset to Defaults
    </button>
  );
}

// ==================================================
// HELPERS
// ==================================================
function input() {
  return "w-full px-4 py-2.5 rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:border-primary transition";
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-primary shrink-0 mt-0.5">{icon}</div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
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

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-bg-secondary transition">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 mt-1 text-primary rounded"
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-xs text-text-muted mt-0.5">{description}</div>
      </div>
    </label>
  );
}