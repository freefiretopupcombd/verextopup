"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

type SubscriptionCard = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  icon: string | null;
  subtitle: string | null;
  categoryName: string | null;
  price: number;
  currency: string;
};

export function DigitalSubscriptions({
  products: initialProducts,
  fetchMoreAction,
}: {
  products: SubscriptionCard[];
  fetchMoreAction?: (offset: number, limit: number) => Promise<SubscriptionCard[]>;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length >= 6);
  const [offset, setOffset] = useState(6);

  const loadMore = async () => {
    if (!fetchMoreAction || isLoading) return;
    setIsLoading(true);
    
    try {
      const newProducts = await fetchMoreAction(offset, 6);
      if (newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts]);
        setOffset((prev) => prev + 6);
      }
      if (newProducts.length < 6) {
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
            Digital Subscriptions
          </h2>
          <p className="text-sm text-text-muted mt-1.5">
            Get your favorite subscriptions at the best price.
          </p>
        </div>
        <Link
          href="/categories/subscriptions"
          className="group text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 ml-4 flex items-center gap-1.5"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
          >
            <div
              className="aspect-square flex items-center justify-center overflow-hidden"
              style={getBrandBg(product.categoryName)}
            >
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl sm:text-5xl">{product.icon || "📺"}</div>
              )}
            </div>

            <div className="p-3 sm:p-4 text-center">
              <h3 className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-primary transition">
                {product.name}
              </h3>
              {product.subtitle && (
                <div className="text-[10px] sm:text-xs text-text-muted mt-1 truncate">
                  {product.subtitle}
                </div>
              )}
              <div className="text-xs sm:text-sm font-bold text-text-primary mt-2">
                ৳{product.price.toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button for Pagination */}
      {hasMore && fetchMoreAction && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </section>
  );
}

function getBrandBg(categoryName: string | null): React.CSSProperties {
  const map: Record<string, string> = {
    Netflix: "linear-gradient(135deg, #E50914, #B20710)",
    Spotify: "linear-gradient(135deg, #1DB954, #158F3F)",
    YouTube: "linear-gradient(135deg, #FF0000, #C4302B)",
    Discord: "linear-gradient(135deg, #5865F2, #4752C4)",
    ChatGPT: "linear-gradient(135deg, #10A37F, #0E8C6D)",
    Google: "linear-gradient(135deg, #4285F4, #1A73E8)",
  };

  const key = Object.keys(map).find((k) =>
    categoryName?.toLowerCase().includes(k.toLowerCase())
  );

  return {
    background: key ? map[key] : "linear-gradient(135deg, #7C3AED20, #2563EB20)",
  };
}