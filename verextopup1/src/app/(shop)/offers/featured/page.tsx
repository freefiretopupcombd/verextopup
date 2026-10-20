import type { Metadata } from "next";

import {
  getFeaturedProducts,
  getOfferCounts,
} from "@/modules/offers/queries";
import { OffersHero } from "@/modules/offers/components/offers-hero";
import { OfferTabs } from "@/modules/offers/components/offer-tabs";
import { OfferProductGrid } from "@/modules/offers/components/offer-product-grid";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "⭐ Featured Products",
  description:
    "সবচেয়ে popular এবং trending game top-up products — featured collection।",
};

export default async function FeaturedPage() {
  const [products, counts] = await Promise.all([
    getFeaturedProducts(48),
    getOfferCounts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <OffersHero tab="featured" totalCount={counts.featured} />
      <OfferTabs current="featured" counts={counts} />
      <OfferProductGrid
        products={products}
        emptyMessage="এখনো কোনো featured product নেই।"
      />
    </div>
  );
}