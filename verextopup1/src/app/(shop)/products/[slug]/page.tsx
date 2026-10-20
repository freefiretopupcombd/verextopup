import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeoSettings } from "@/modules/seo/queries";
import { ProductFaqJsonLd } from "@/modules/seo/components/product-faq-json-ld";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/modules/products/queries";
import { ProductView } from "@/modules/products/components/product-view";
import { RelatedProducts } from "@/modules/products/components/related-products";
import { ProductJsonLd } from "@/modules/seo/components/product-json-ld";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { isUddoktaPayEnabled } from "@/modules/payments/gateways/uddoktapay-config";

export const revalidate = 600; // 10 min
// ==================================================
// SITE CONFIG
// ==================================================
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://verextopup.com";
const SITE_NAME = "VerexTopUp";

// ==================================================
// METADATA — Full SEO (2026)
// ==================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  // ---- Fallbacks chain ----
  const title = product.seoTitle || product.name;
  const description =
    product.seoDescription ||
    product.shortDesc ||
    `${product.name} কিনুন সবচেয়ে সেরা দামে। Instant delivery, 100% safe।`;
  const canonicalUrl =
    product.canonicalUrl || `${SITE_URL}/products/${product.slug}`;
  const ogImage =
    product.ogImage || product.thumbnail || `${SITE_URL}/og-default.jpg`;
  const ogTitle = product.ogTitle || title;
  const ogDescription = product.ogDescription || description;
  const twitterCard = product.twitterCard || "summary_large_image";
  const twitterImage = product.twitterImage || ogImage;

  // ---- Keywords ----
  const keywords: string[] = [];
  if (product.primaryKeyword) keywords.push(product.primaryKeyword);
  if (product.seoKeywords) {
    keywords.push(
      ...product.seoKeywords
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean)
    );
  }
  if (product.secondaryKeywords) {
    keywords.push(
      ...product.secondaryKeywords
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean)
    );
  }
  if (product.brand) keywords.push(product.brand);
  if (product.category?.name) keywords.push(product.category.name);

  // ---- Robots ----
  const isIndexable = product.isIndexable ?? true;
  const isFollowable = product.isFollowable ?? true;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: isIndexable,
      follow: isFollowable,
      googleBot: {
        index: isIndexable,
        follow: isFollowable,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: "en_US",
      alternateLocale: ["bn_BD"],
    },

    twitter: {
      card: twitterCard as
        | "summary"
        | "summary_large_image"
        | "player"
        | "app",
      title: ogTitle,
      description: ogDescription,
      images: [twitterImage],
    },

    other: {
      "product:brand": product.brand || "",
      "product:price:amount": String(product.variants?.[0]?.price ?? ""),
      "product:price:currency": product.currency || "BDT",
    },
  };
}

// ==================================================
// PAGE
// ==================================================
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();
  const seoSettings = await getSeoSettings();

  // ---- Logged-in user + wallet balance ----
  const session = await auth();
  const isLoggedIn = !!session?.user;

  let walletBalance = 0;
  if (isLoggedIn) {
    const userId = (session!.user as any).id as string;
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });
    walletBalance = wallet ? Number(wallet.balance) : 0;
  }

  // ---- Active payment methods ----
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      logo: true,
      accountNumber: true,
      merchantNumber: true,
      instructions: true,
      inputFields: true,
    },
  });

  // ---- UddoktaPay enabled? ----
  // ✅ NEW: Check if UddoktaPay gateway is enabled
  const uddoktaPayEnabled = await isUddoktaPayEnabled();

  // ---- Related products ----
  const related = await getRelatedProducts(
    product.id,
    product.category?.id || null,
    8
  );

  // ---- Breadcrumb items ----
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    ...(product.category
      ? [
          {
            name: product.category.name,
            url: `/categories/${product.category.slug}`,
          },
        ]
      : []),
    {
      name: product.breadcrumbLabel || product.name,
      url: `/products/${product.slug}`,
    },
  ];

  // ---- Prices for JSON-LD ----
  const firstVariant = product.variants?.[0];
  const price =
    firstVariant?.salePrice ?? firstVariant?.price ?? product.price;
  const inStock = product.variants?.some(
    (v: any) => v.unlimitedStock || (v.stock ?? 0) > 0
  );

  return (
    <>
      {/* ---------- JSON-LD: Product + Offer + AggregateRating ---------- */}
      <ProductJsonLd
        siteUrl={seoSettings.siteUrl}
        product={{
          name: product.name,
          description: product.seoDescription || product.shortDesc || "",
          image: product.thumbnail || product.icon || "",
          sku: product.sku || product.slug,
          brand: product.brand || SITE_NAME,
          slug: product.slug,
          price,
          currency: product.currency || "BDT",
          inStock: inStock ?? true,
          ratingValue: (product as any).avgRating ?? null,
          reviewCount: (product as any).reviewCount ?? 0,
          reviews: product.reviews?.slice(0, 5).map((r: any) => ({
            authorName: r.user?.name || "Anonymous",
            ratingValue: r.rating,
            content: r.content,
            datePublished: r.createdAt,
          })),
        }}
      />

      {/* ---------- JSON-LD: BreadcrumbList ---------- */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* FAQ Schema — only if FAQs exist */}
      {product.faqs && product.faqs.length > 0 && (
        <ProductFaqJsonLd
          faqs={product.faqs.map(
            (f: { question: string; answer: string }) => ({
              question: f.question,
              answer: f.answer,
            })
          )}
        />
      )}

            {/* ---------- Product UI ---------- */}
      <ProductView
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDesc: product.shortDesc,
          fullDesc: product.fullDesc,
          thumbnail: product.thumbnail,
          icon: product.icon,
          brand: product.brand,
          instructions: product.instructions,
          terms: product.terms,
          soldCount: product.soldCount,
          productType: product.productType,
          variants: product.variants,
          fields: product.fields,
          category: product.category,
          reviews: product.reviews || [],

          // ✅ NEW: Dynamic Badges
          badge1Text: (product as any).badge1Text ?? null,
          badge1Icon: (product as any).badge1Icon ?? null,
          badge1Color: (product as any).badge1Color ?? null,
          badge2Text: (product as any).badge2Text ?? null,
          badge2Icon: (product as any).badge2Icon ?? null,
          badge2Color: (product as any).badge2Color ?? null,
          badge3Text: (product as any).badge3Text ?? null,
          badge3Icon: (product as any).badge3Icon ?? null,
          badge3Color: (product as any).badge3Color ?? null,
        }}
        isLoggedIn={isLoggedIn}
        walletBalance={walletBalance}
        paymentMethods={paymentMethods.map((pm) => ({
          ...pm,
          inputFields: Array.isArray(pm.inputFields) ? pm.inputFields : [],
        }))}
        uddoktaPayEnabled={uddoktaPayEnabled}
      />

      {/* ---------- Related products ---------- */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
          <RelatedProducts products={related} />
        </div>
      )}
    </>
  );
}