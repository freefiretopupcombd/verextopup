import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

import { requireAdmin } from "@/lib/auth/session";
import { getSeoSettings } from "@/modules/seo/queries";
import { analyzeSeoSettings } from "@/modules/seo/settings-schema";
import { SeoSettingsForm } from "@/modules/seo/components/admin/seo-settings-form";

export const metadata: Metadata = {
  title: "SEO Settings — Admin",
  robots: { index: false, follow: false },
};

export default async function SeoSettingsPage() {
  // Server-side auth check
  await requireAdmin();

  const settings = await getSeoSettings();

  // Run health analysis (non-blocking warnings)
  const warnings = analyzeSeoSettings({
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    siteUrl: settings.siteUrl,
    organizationName: settings.organizationName,
    organizationLegalName: settings.organizationLegalName,
    organizationLogo: settings.organizationLogo,
    organizationType: settings.organizationType as any,
    foundingYear: settings.foundingYear,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    addressStreet: settings.addressStreet,
    addressCity: settings.addressCity,
    addressRegion: settings.addressRegion,
    addressPostalCode: settings.addressPostalCode,
    addressCountry: settings.addressCountry,
    socialFacebook: settings.socialFacebook,
    socialYoutube: settings.socialYoutube,
    socialInstagram: settings.socialInstagram,
    socialTwitter: settings.socialTwitter,
    socialTiktok: settings.socialTiktok,
    socialWhatsapp: settings.socialWhatsapp,
    socialTelegram: settings.socialTelegram,
    defaultOgImage: settings.defaultOgImage,
    defaultTwitterCard: settings.defaultTwitterCard,
    twitterHandle: settings.twitterHandle,
    analyticsGaId: settings.analyticsGaId,
    analyticsGtmId: settings.analyticsGtmId,
    verificationGoogle: settings.verificationGoogle,
    verificationBing: settings.verificationBing,
    enableIndexing: settings.enableIndexing,
    primaryLocale: settings.primaryLocale,
    alternateLocales: settings.alternateLocales,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ---------- Header ---------- */}
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          SEO Settings
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Google search, social sharing, ও site verification এর সব configuration
        </p>
      </div>

      {/* ---------- Health Warnings ---------- */}
      {warnings.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-text-primary">
                {warnings.length}টি suggestion
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                এগুলো বাধ্যতামূলক না, তবে SEO improve করবে
              </p>
            </div>
          </div>
          <ul className="space-y-1.5 pl-7">
            {warnings.map((w, idx) => (
              <li
                key={`${w.field}-${idx}`}
                className="text-sm text-text-primary flex items-start gap-2"
              >
                <span className="text-xs uppercase font-mono shrink-0 mt-0.5 text-text-muted">
                  [{w.level}]
                </span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------- Form ---------- */}
      <SeoSettingsForm initialData={settings} />
    </div>
  );
}