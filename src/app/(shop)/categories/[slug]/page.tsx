import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCategoryWithDetails,
  listProductsPaged,
} from "@/modules/products/queries";
import { getSeoSettings } from "@/modules/seo/queries";
import { ListingHeader } from "@/modules/products/components/listing-header";
import { ProductGrid } from "@/modules/products/components/product-grid";
import { SortDropdown } from "@/modules/products/components/sort-dropdown";
import { Pagination } from "@/modules/products/components/pagination";
import { EmptyState } from "@/modules/products/components/empty-state";

// ==================================================
// DYNAMIC METADATA
// ==================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryWithDetails(slug);

  if (!category) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false },
    };
  }

  const settings = await getSeoSettings();

  // ---- Fallback chain ----
  const title = category.seoTitle || category.name;
  const description =
    category.seoDescription ||
    category.description ||
    `Browse ${category.name} products at ${settings.siteName}. Best prices, instant delivery.`;

  const canonicalUrl = `${settings.siteUrl}/categories/${category.slug}`;
  const ogImage = `${settings.siteUrl}${settings.defaultOgImage}`;

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
      locale: settings.primaryLocale,
      alternateLocale: settings.alternateLocales,
    },

    twitter: {
      card: settings.defaultTwitterCard,
      title,
      description,
      images: [ogImage],
    },
  };
}

// ==================================================
// CATEGORY PAGE
// ==================================================
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { sort, page: pageStr } = await searchParams;

  const category = await getCategoryWithDetails(slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(pageStr || "1"));

  const { products, total, totalPages } = await listProductsPaged({
    categorySlug: slug,
    sort: (sort as any) || "newest",
    page,
    perPage: 24,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Category header with breadcrumbs */}
      <ListingHeader
        title={category.name}
        description={category.description}
        icon={category.icon}
        image={category.image}
        productCount={total}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      {/* Sub-categories */}
      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="inline-flex items-center gap-1.5 bg-bg-card border border-border hover:border-primary/50 rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary transition"
            >
              {child.icon && <span>{child.icon}</span>}
              {child.name}
              <span className="text-text-muted">({child.productsCount})</span>
            </a>
          ))}
        </div>
      )}

      {/* Toolbar */}
      {products.length > 0 && (
        <div className="flex items-center justify-between mb-5">
          <div className="text-xs sm:text-sm text-text-muted">
            Showing {products.length} of {total}
          </div>
          <SortDropdown />
        </div>
      )}

      {/* Products */}
      {products.length === 0 ? (
        <EmptyState
          title="এই category-তে কোনো product নেই"
          description="শীঘ্রই আরো product আসছে।"
          actionHref="/products"
          actionLabel="সব Product দেখুন"
        />
      ) : (
        <>
          <ProductGrid products={products} />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}