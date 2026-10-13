import { NextResponse } from "next/server";
import { getPWAConfig } from "@/modules/pwa/settings";
import type { PWAIconData } from "@/modules/pwa/types";

// ==================================================
// DYNAMIC MANIFEST
// ==================================================
// Returns manifest.json based on admin config
// ==================================================

function resolveIconSrc(icon: PWAIconData): string {
  if (!icon.src) return "";
  return icon.src;
}

export async function GET() {
  const config = await getPWAConfig();

  if (!config.enabled) {
    // Return empty manifest
    return NextResponse.json(
      { name: "Disabled", start_url: "/" },
      {
        headers: {
          "Content-Type": "application/manifest+json",
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      }
    );
  }

  const icons: any[] = [];

  // Add icons that have src
  if (config.icons.icon192.src) {
    icons.push({
      src: resolveIconSrc(config.icons.icon192),
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    });
  }
  if (config.icons.icon512.src) {
    icons.push({
      src: resolveIconSrc(config.icons.icon512),
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    });
  }
  if (config.icons.maskable192.src) {
    icons.push({
      src: resolveIconSrc(config.icons.maskable192),
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    });
  }
  if (config.icons.maskable512.src) {
    icons.push({
      src: resolveIconSrc(config.icons.maskable512),
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    });
  }

  const manifest = {
    id: "/",
    name: config.name,
    short_name: config.shortName,
    description: config.description,
    start_url: "/",
    display: config.display,
    orientation: config.orientation,
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    scope: "/",
    lang: config.lang,
    categories: ["shopping", "games", "entertainment"],
    icons,
    shortcuts: [
      {
        name: "My Orders",
        short_name: "Orders",
        url: "/account/orders",
      },
      {
        name: "My Wallet",
        short_name: "Wallet",
        url: "/account/wallet",
      },
      {
        name: "Products",
        short_name: "Shop",
        url: "/products",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}