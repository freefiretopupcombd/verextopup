import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { CurrencyProvider } from "@/modules/currency/context";
import { getCurrencySettings } from "@/modules/settings/actions";
import { getSeoSettings } from "@/modules/seo/queries";
import { OrganizationJsonLd } from "@/modules/seo/components/organization-json-ld";
import { WebsiteJsonLd } from "@/modules/seo/components/website-json-ld";
import { absoluteUrl } from "@/modules/seo/defaults";
import { LiveTracker } from "@/modules/analytics/components/live-tracker";

// ✅ PWA imports
import { PWAProvider } from "@/modules/pwa/components/pwa-provider";
import { PWAInstallBanner } from "@/modules/pwa/components/pwa-install-banner";
import { ServiceWorkerRegister } from "@/modules/pwa/components/sw-register";
import { getPWAConfig } from "@/modules/pwa/settings";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ==================================================
// DYNAMIC METADATA
// ==================================================
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const pwaConfig = await getPWAConfig();

  // ---- Build verification meta (only if provided) ----
  const verification: Metadata["verification"] = {};
  if (seo.verificationGoogle) {
    verification.google = seo.verificationGoogle;
  }
  if (seo.verificationBing) {
    (verification as Record<string, unknown>)["other"] = {
      "msvalidate.01": seo.verificationBing,
    };
  }

  // ---- OG image absolute URL ----
  const ogImage = absoluteUrl(seo.defaultOgImage, seo.siteUrl);

  return {
    metadataBase: new URL(seo.siteUrl),

    title: {
      default: `${seo.siteName} — ${seo.siteDescription ? "" : ""}${seo.organizationName}`.trim(),
      template: `%s | ${seo.siteName}`,
    },
    description: seo.siteDescription,

    applicationName: seo.siteName,
    authors: [{ name: seo.organizationName, url: seo.siteUrl }],
    creator: seo.organizationName,
    publisher: seo.organizationName,

    // ---- Canonical / Alternates ----
    alternates: {
      canonical: "/",
      languages: {
        [seo.primaryLocale.replace("_", "-")]: "/",
        ...Object.fromEntries(
          seo.alternateLocales.map((locale) => [
            locale.replace("_", "-"),
            "/",
          ])
        ),
      },
    },

    // ---- Robots ----
    robots: seo.enableIndexing
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
        },

    // ---- Open Graph ----
    openGraph: {
      type: "website",
      siteName: seo.siteName,
      title: seo.siteName,
      description: seo.siteDescription,
      url: seo.siteUrl,
      locale: seo.primaryLocale,
      alternateLocale: seo.alternateLocales,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seo.siteName,
        },
      ],
    },

    // ---- Twitter ----
    twitter: {
      card: seo.defaultTwitterCard,
      title: seo.siteName,
      description: seo.siteDescription,
      images: [ogImage],
      ...(seo.twitterHandle
        ? {
            site: seo.twitterHandle.startsWith("@")
              ? seo.twitterHandle
              : `@${seo.twitterHandle}`,
          }
        : {}),
    },

    // ---- Verification ----
    ...(Object.keys(verification).length > 0
      ? { verification }
      : {}),

    // ---- Extra meta ----
    other: {
      "geo.region": seo.addressCountry || "BD",
      "format-detection": "telephone=no",
    },

    // ✅ PWA Manifest — dynamic, admin-configurable
    manifest: "/api/pwa/manifest",

    // ✅ iOS PWA support
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: pwaConfig.shortName || seo.siteName || "VerexTopUp",
    },

    // ✅ Icons — uses admin config or fallback
    icons: {
      icon: pwaConfig.icons.icon192.src
        ? [{ url: pwaConfig.icons.icon192.src, sizes: "192x192" }]
        : [
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
      apple: pwaConfig.icons.apple.src
        ? [{ url: pwaConfig.icons.apple.src, sizes: "180x180" }]
        : [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
          ],
      shortcut: ["/favicon.ico"],
    },
  };
}

// ==================================================
// VIEWPORT
// ==================================================
export async function generateViewport(): Promise<Viewport> {
  const pwaConfig = await getPWAConfig();

  return {
    themeColor: pwaConfig.themeColor || "#7C3AED",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}

// ==================================================
// ROOT LAYOUT
// ==================================================
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ usdToBdt, defaultCurrency }, pwaConfig] = await Promise.all([
    getCurrencySettings(),
    getPWAConfig(),
  ]);

  return (
    <html
      lang={pwaConfig.lang || "en"}
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        <CurrencyProvider
          initialCurrency={defaultCurrency}
          usdToBdt={usdToBdt}
        >
          <PWAProvider config={pwaConfig}>
            <LiveTracker />
            {children}

            {pwaConfig.enabled && pwaConfig.bannerEnabled && (
              <PWAInstallBanner config={pwaConfig} />
            )}
          </PWAProvider>
        </CurrencyProvider>

        <Toaster position="top-center" richColors theme="dark" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}