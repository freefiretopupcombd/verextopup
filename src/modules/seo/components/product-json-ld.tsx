// ==================================================
// Product JSON-LD (Schema.org)
// 2026 Google standard — Product + Offer + AggregateRating + Review
// ==================================================

type ReviewInput = {
  authorName: string;
  ratingValue: number;
  content: string;
  datePublished: string;
};

type ProductJsonLdProps = {
  product: {
    name: string;
    description: string;
    image: string;
    sku: string;
    brand: string;
    slug: string;
    price: number;
    currency: string;
    inStock: boolean;
    ratingValue: number | null;
    reviewCount: number;
    reviews?: ReviewInput[];
  };
  siteUrl?: string; // ← নতুন
};

export function ProductJsonLd({ product, siteUrl }: ProductJsonLdProps) {
  const SITE_URL = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://verextopup.com";
  const url = `${SITE_URL}/products/${product.slug}`;

  // ---- Base Product schema ----
  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    url,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
  };

  if (product.image) {
    productSchema.image = product.image.startsWith("http")
      ? product.image
      : `${SITE_URL}${product.image}`;
  }

  // ---- Offer (with availability + price) ----
  productSchema.offers = {
    "@type": "Offer",
    url,
    priceCurrency: product.currency,
    price: product.price,
    availability: product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: "VerexTopUp",
      url: SITE_URL,
    },
  };

  // ---- AggregateRating (only if real reviews exist) ----
  if (
    product.ratingValue !== null &&
    product.ratingValue > 0 &&
    product.reviewCount > 0
  ) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingValue.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // ---- Individual Reviews (top 5) ----
  if (product.reviews && product.reviews.length > 0) {
    productSchema.review = product.reviews.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.authorName,
      },
      datePublished: r.datePublished,
      reviewBody: r.content,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.ratingValue,
        bestRating: 5,
        worstRating: 1,
      },
    }));
  }

  // ---- Render as JSON-LD script ----
  // Note: using dangerouslySetInnerHTML for JSON-LD injection is the
  // recommended approach in Next.js App Router. Content is generated
  // from trusted DB data, JSON.stringify escapes all HTML chars.
  const jsonLd = JSON.stringify(productSchema);

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}