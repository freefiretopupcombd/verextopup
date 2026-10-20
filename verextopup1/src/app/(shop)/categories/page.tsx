import type { Metadata } from "next";
import Link from "next/link";

import { listCategories } from "@/modules/products/queries";

export const metadata: Metadata = {
  title: "সব Categories — VerexTopUp",
  description: "সব game categories, gift cards, subscriptions",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">
          All Categories
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {categories.length} টা category
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-text-muted">এখনো কোনো category নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group bg-bg-card border border-border rounded-xl p-4 sm:p-5 text-center hover:border-primary/50 transition-all"
            >
              {cat.icon ? (
                <div className="text-4xl sm:text-5xl mb-3">{cat.icon}</div>
              ) : cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-lg object-cover mb-3"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-lg bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center text-2xl sm:text-3xl mb-3">
                  🎮
                </div>
              )}
              <h3 className="font-semibold text-text-primary text-sm sm:text-base group-hover:text-primary transition truncate">
                {cat.name}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {cat.productsCount} products
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}