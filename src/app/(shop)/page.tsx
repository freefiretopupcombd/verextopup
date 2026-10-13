import type { Metadata } from "next";

import { getFeaturedProducts } from "@/modules/products/queries";
import { getHomepageCategories } from "@/modules/categories/queries";
import { fetchCategoryWithProductsAction } from "@/modules/categories/actions";
import { getRenderedHomepageSections } from "@/modules/homepage/queries";
import { SectionRenderer } from "@/modules/homepage/components";
import { listPublishedPosts } from "@/modules/blog/queries";
import { getSeoSettings } from "@/modules/seo/queries";
import { buildHomepageTitle } from "@/modules/seo/defaults";

import { HeroSection } from "@/modules/shop/components/home/hero-section";
import { PopularGames } from "@/modules/shop/components/home/popular-games";
import { PromoBanner } from "@/modules/shop/components/home/promo-banner";
import { BlogSection } from "@/modules/shop/components/home/blog-section";

// ==================================================
// METADATA
// ==================================================
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();
  const homepageTitle = buildHomepageTitle(settings);

  return {
    title: { absolute: homepageTitle },
    description: settings.siteDescription,
    alternates: { canonical: "/" },
    robots: {
      index: settings.enableIndexing,
      follow: settings.enableIndexing,
      googleBot: {
        index: settings.enableIndexing,
        follow: settings.enableIndexing,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title: homepageTitle,
      description: settings.siteDescription,
      url: settings.siteUrl,
      images: [
        {
          url: `${settings.siteUrl}${settings.defaultOgImage}`,
          width: 1200,
          height: 630,
          alt: settings.siteName,
        },
      ],
      locale: settings.primaryLocale,
      alternateLocale: settings.alternateLocales,
    },
    twitter: {
      card: settings.defaultTwitterCard,
      title: homepageTitle,
      description: settings.siteDescription,
      images: [`${settings.siteUrl}${settings.defaultOgImage}`],
      ...(settings.twitterHandle
        ? {
            site: settings.twitterHandle.startsWith("@")
              ? settings.twitterHandle
              : `@${settings.twitterHandle}`,
          }
        : {}),
    },
  };
}

// ==================================================
// HOMEPAGE
// ==================================================
export default async function HomePage() {
  const [categories, blogData, dynamicSections] = await Promise.all([
    getHomepageCategories(),
    listPublishedPosts({ page: 1, perPage: 3 }),
    getRenderedHomepageSections(),
  ]);

  return (
    <div>
      {/* 1. Hero Slider */}
      <HeroSection />

      {/* 2. Popular Products (Categories) */}
      <PopularGames
        categories={categories}
        fetchCategory={fetchCategoryWithProductsAction}
      />

      {/* 3. Dynamic Sections (admin-controlled) */}
      {dynamicSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      {/* 4. Blog Section */}
      <BlogSection posts={blogData.posts} />

      {/* 5. Promo Banner — Join VerexTopUp Today (below blog) */}
      <PromoBanner />
    </div>
  );
}