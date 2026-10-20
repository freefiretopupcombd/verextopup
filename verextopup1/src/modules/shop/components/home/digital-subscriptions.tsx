import Link from "next/link";
import { Play } from "lucide-react";

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
  products,
}: {
  products: SubscriptionCard[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">
            Digital Subscriptions
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Get your favorite subscriptions at the best price.
          </p>
        </div>
        <Link
          href="/categories/subscriptions"
          className="text-xs sm:text-sm text-primary hover:underline font-medium shrink-0 ml-3"
        >
          View All
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {products.slice(0, 6).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
          >
            {/* Icon area */}
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

            {/* Info */}
            <div className="p-2.5 text-center">
              <h3 className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-primary transition">
                {product.name}
              </h3>
              {product.subtitle && (
                <div className="text-[10px] text-text-muted mt-0.5 truncate">
                  {product.subtitle}
                </div>
              )}
              <div className="text-xs sm:text-sm font-bold text-text-primary mt-1.5">
                ৳{product.price.toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function getBrandBg(categoryName: string | null): React.CSSProperties {
  // Simple brand-ish backgrounds based on category name
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