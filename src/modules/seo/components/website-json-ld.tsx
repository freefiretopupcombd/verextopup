import { getSeoSettings } from "../queries";

// ==================================================
// WebSite JSON-LD
// ==================================================
// Injects Schema.org WebSite structured data.
//
// Google uses this for:
//   - Sitelinks Search Box (search box under site name in SERP)
//   - Brand verification
//   - Site name in search results
//
// The `potentialAction` enables the search box feature.
// The `inLanguage` and `alternateName` help Google serve
// the site in the right locale.
// ==================================================

export async function WebsiteJsonLd() {
  const settings = await getSeoSettings();

  // ---- Base WebSite schema ----
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: settings.siteUrl,
    inLanguage: settings.primaryLocale.replace("_", "-"),
  };

  // ---- Alternate name (short brand name) ----
  // Helps Google recognize brand variations
  if (settings.organizationName !== settings.siteName) {
    schema.alternateName = settings.organizationName;
  }

  // ---- Description ----
  if (settings.siteDescription) {
    schema.description = settings.siteDescription;
  }

  // ---- Publisher (link to Organization) ----
  schema.publisher = {
    "@type": "Organization",
    name: settings.organizationName,
    url: settings.siteUrl,
  };

  // ---- SearchAction (Sitelinks Search Box) ----
  // This tells Google that our site has a search page
  // so they can show a search box in SERP results.
  schema.potentialAction = {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${settings.siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  };

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