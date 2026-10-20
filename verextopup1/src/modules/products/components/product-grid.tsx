import {
  ProductCard,
  type ProductCardData,
} from "./product-card";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product, index) => (
  <ProductCard
    key={product.id}
    product={product}
    priority={index < 4}  // ⚠️ First 4 products priority
  />
))}
    </div>
  );
}