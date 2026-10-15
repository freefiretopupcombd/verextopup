import type { Metadata } from "next";

import {
  getAllOffers,
  getOfferCounts,
} from "@/modules/offers/queries";
import { OffersHero } from "@/modules/offers/components/offers-hero";
import { OfferTabs } from "@/modules/offers/components/offer-tabs";
import { OfferProductGrid } from "@/modules/offers/components/offer-product-grid";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All Offers & Deals",
  description:
    "Free Fire, PUBG, Mobile Legends — সব game top-up এ best price এবং exclusive offers। সীমিত সময়ের discount এখনই নিন!",
};

export default async function OffersPage() {
  const [products, counts] = await Promise.all([
    getAllOffers(48),
    getOfferCounts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <OffersHero tab="all" totalCount={counts.all} />
      <OfferTabs current="all" counts={counts} />
      <OfferProductGrid
        products={products}
        emptyMessage="এখনো কোনো offer নেই। শীঘ্রই আসছে!"
      />
    </div>
  );
}