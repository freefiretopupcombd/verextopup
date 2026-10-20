import Link from "next/link";

import {
  ProductCard,
  type ProductCardData,
} from "@/modules/products/components/product-card";

export function FeaturedProducts({
  products,
}: {
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">
            Featured Products
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Most popular and high demand products.
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs sm:text-sm text-primary hover:underline font-medium shrink-0 ml-3"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}