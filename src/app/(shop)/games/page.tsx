import type { Metadata } from "next";
import Link from "next/link";

import { listCategories } from "@/modules/products/queries";

export const metadata: Metadata = {
  title: "Games — VerexTopUp",
  description: "সব game top-up এবং currency",
};

export default async function GamesPage() {
  const categories = await listCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">
          All Games
        </h1>
        <p className="text-sm text-text-muted mt-1">
          আপনার প্রিয় game-এর top-up করুন
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-text-muted">এখনো কোনো game নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/15 via-bg-secondary to-bg-card flex items-center justify-center overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : cat.icon ? (
                  <div className="text-5xl sm:text-6xl">{cat.icon}</div>
                ) : (
                  <div className="text-5xl sm:text-6xl">🎮</div>
                )}
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-text-primary text-sm truncate group-hover:text-primary transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {cat.productsCount} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}