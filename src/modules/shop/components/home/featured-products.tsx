"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/modules/products/components/product-card";

export function FeaturedProducts({
  products: initialProducts,
  fetchMoreAction,
}: {
  products: ProductCardData[];
  fetchMoreAction?: (offset: number, limit: number) => Promise<ProductCardData[]>;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length >= 4);
  const [offset, setOffset] = useState(4);

  const loadMore = async () => {
    if (!fetchMoreAction || isLoading) return;
    setIsLoading(true);
    
    try {
      const newProducts = await fetchMoreAction(offset, 4);
      if (newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts]);
        setOffset((prev) => prev + 4);
      }
      if (newProducts.length < 4) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
      <div className="flex items-end justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
            Featured Products
          </h2>
          <p className="text-sm text-text-muted mt-1.5">
            Most popular and high demand products.
          </p>
        </div>
        <Link
          href="/products"
          className="group text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 ml-4 flex items-center gap-1.5"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && fetchMoreAction && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Loading...</> : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}