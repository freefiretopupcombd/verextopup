import type { Metadata } from "next";

import {
  getNewArrivals,
  getOfferCounts,
} from "@/modules/offers/queries";
import { OffersHero } from "@/modules/offers/components/offers-hero";
import { OfferTabs } from "@/modules/offers/components/offer-tabs";
import { OfferProductGrid } from "@/modules/offers/components/offer-product-grid";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "✨ New Arrivals",
  description:
    "সবচেয়ে নতুন game top-up, gift card, এবং subscription — সব এক জায়গায়।",
};

export default async function NewArrivalsPage() {
  const [products, counts] = await Promise.all([
    getNewArrivals(48),
    getOfferCounts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <OffersHero tab="new-arrivals" totalCount={counts.newArrivals} />
      <OfferTabs current="new-arrivals" counts={counts} />
      <OfferProductGrid
        products={products}
        emptyMessage="এখনো কোনো new arrival নেই। শীঘ্রই আসছে!"
      />
    </div>
  );
}