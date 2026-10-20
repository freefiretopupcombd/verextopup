import type { Metadata } from "next";

import {
  getFlashSaleProducts,
  getOfferCounts,
} from "@/modules/offers/queries";
import { OffersHero } from "@/modules/offers/components/offers-hero";
import { OfferTabs } from "@/modules/offers/components/offer-tabs";
import { OfferProductGrid } from "@/modules/offers/components/offer-product-grid";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "⚡ Flash Sale — 30%+ Off",
  description:
    "সীমিত সময়ের flash sale! Free Fire, PUBG, MLBB diamonds ৩০%+ discount এ। এখনই কিনুন!",
};

export default async function FlashSalePage() {
  const [products, counts] = await Promise.all([
    getFlashSaleProducts(48),
    getOfferCounts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <OffersHero tab="flash-sale" totalCount={counts.flashSale} />
      <OfferTabs current="flash-sale" counts={counts} />
      <OfferProductGrid
        products={products}
        emptyMessage="এখনো কোনো flash sale নেই। পরের sale এ চেক করুন!"
      />
    </div>
  );
}