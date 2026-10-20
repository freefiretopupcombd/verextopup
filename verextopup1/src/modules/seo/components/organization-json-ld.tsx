import { getSeoSettings } from "../queries";
import {
  absoluteUrl,
  buildSocialLinks,
  hasAddress,
} from "../defaults";

// ==================================================
// Organization JSON-LD
// ==================================================
// Injects Schema.org Organization structured data.
// All data comes from dynamic SEO settings (admin editable).
//
// Google uses this for:
//   - Knowledge Panel (brand info on search)
//   - Organization verification
//   - Social profile linking
//   - Contact info display
// ==================================================

export async function OrganizationJsonLd() {
  const settings = await getSeoSettings();

  // ---- Base Organization schema ----
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": settings.organizationType || "Organization",
    name: settings.organizationName,
    url: settings.siteUrl,
  };

  // ---- Legal name (if provided) ----
  if (settings.organizationLegalName) {
    schema.legalName = settings.organizationLegalName;
  }

  // ---- Logo ----
  if (settings.organizationLogo) {
    schema.logo = absoluteUrl(settings.organizationLogo, settings.siteUrl);
  }

  // ---- Founding year ----
  if (settings.foundingYear) {
    schema.foundingDate = settings.foundingYear;
  }

  // ---- Description ----
  if (settings.siteDescription) {
    schema.description = settings.siteDescription;
  }

  // ---- Contact point (only if email or phone provided) ----
  if (settings.contactEmail || settings.contactPhone) {
    const contactPoint: Record<string, unknown> = {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["English", "Bengali"],
    };

    if (settings.contactEmail) {
      contactPoint.email = settings.contactEmail;
    }
    if (settings.contactPhone) {
      contactPoint.telephone = settings.contactPhone;
    }

    schema.contactPoint = [contactPoint];
  }

  // ---- Address (only if fully configured) ----
  if (hasAddress(settings)) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: settings.addressStreet,
      addressLocality: settings.addressCity,
      addressRegion: settings.addressRegion || undefined,
      postalCode: settings.addressPostalCode || undefined,
      addressCountry: settings.addressCountry,
    };
  }

  // ---- Social links (sameAs) ----
  const socialLinks = buildSocialLinks(settings);
  if (socialLinks.length > 0) {
    schema.sameAs = socialLinks;
  }

  // ---- Render ----
  const jsonLd = JSON.stringify(schema);

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}