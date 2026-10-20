"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import type { HomepageCategory, CategoryWithProducts } from "../queries";
import { CategoryCard } from "./category-card";
import { CategoryPopup } from "./category-popup";

// ==================================================
// CATEGORY GRID
// ==================================================
// Displays homepage category cards.
// On click → fetches products → opens popup.
//
// Layout:
//   - Mobile: 2 per row
//   - Desktop: 3 per row
// ==================================================

export function CategoryGrid({
  categories,
  categoryLoader,
}: {
  categories: HomepageCategory[];
  categoryLoader: (slug: string) => Promise<CategoryWithProducts | null>;
}) {
  const [activeCategory, setActiveCategory] =
    useState<CategoryWithProducts | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const handleCategoryClick = async (slug: string) => {
    setLoadingSlug(slug);
    try {
      const data = await categoryLoader(slug);
      if (data) {
        setActiveCategory(data);
      }
    } finally {
      setLoadingSlug(null);
    }
  };

  if (categories.length === 0) return null;

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isLoading = loadingSlug === cat.slug;
          return (
            <div key={cat.id} className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-bg-card/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              )}
              <CategoryCard
                category={cat}
                onClick={() => handleCategoryClick(cat.slug)}
              />
            </div>
          );
        })}
      </div>

      {/* Popup */}
      {activeCategory && (
        <CategoryPopup
          category={activeCategory}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </>
  );
}

// ==================================================
// WRAPPER WITH SERVER LOADER
// ==================================================
// Since we can't pass server functions as props directly,
// we create a client wrapper that fetches on click via
// a server action.
// ==================================================