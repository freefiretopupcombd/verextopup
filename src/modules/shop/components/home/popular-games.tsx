"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { CategoryCard } from "@/modules/categories/components/category-card";
import { CategoryPopup } from "@/modules/categories/components/category-popup";
import type {
  HomepageCategory,
  CategoryWithProducts,
} from "@/modules/categories/queries";

// ==================================================
// POPULAR GAMES (Horizontal Drag Scroll)
// ==================================================
// Features:
//   - No arrows (clean)
//   - Touch/trackpad scroll (native)
//   - Mouse drag scroll (desktop)
//   - Click vs drag detection
// ==================================================
export function PopularGames({
  categories,
  fetchCategory,
}: {
  categories: HomepageCategory[];
  fetchCategory: (
    slug: string
  ) => Promise<CategoryWithProducts | null>;
}) {
  const [activeCategory, setActiveCategory] =
    useState<CategoryWithProducts | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });

  // ==================================================
  // Mouse drag to scroll
  // ==================================================
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      // Only left click
      if (e.button !== 0) return;
      dragState.current.isDown = true;
      dragState.current.hasMoved = false;
      dragState.current.startX = e.pageX - el.offsetLeft;
      dragState.current.scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current.isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = x - dragState.current.startX;
      if (Math.abs(walk) > 5) {
        dragState.current.hasMoved = true;
      }
      el.scrollLeft = dragState.current.scrollLeft - walk;
    };

    const onMouseUp = () => {
      dragState.current.isDown = false;
      el.style.cursor = "grab";
      // Reset hasMoved after a short delay so click handler can check it
      setTimeout(() => {
        dragState.current.hasMoved = false;
      }, 50);
    };

    const onMouseLeave = () => {
      dragState.current.isDown = false;
      el.style.cursor = "grab";
    };

    el.style.cursor = "grab";
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // ==================================================
  // Click handler (skip if user dragged)
  // ==================================================
  const handleCardClick = async (category: HomepageCategory) => {
    // If user was dragging, don't trigger click
    if (dragState.current.hasMoved) return;

    // Single product → redirect
    if (category.productsCount === 1) {
      setLoadingSlug(category.slug);
      try {
        const data = await fetchCategory(category.slug);
        if (data && data.products.length === 1) {
          window.location.href = `/products/${data.products[0].slug}`;
        } else if (data) {
          setActiveCategory(data);
        }
      } catch (err) {
        console.error("Failed to load category:", err);
      } finally {
        setLoadingSlug(null);
      }
      return;
    }

    // Multiple products → popup
    setLoadingSlug(category.slug);
    try {
      const data = await fetchCategory(category.slug);
      if (data) setActiveCategory(data);
    } catch (err) {
      console.error("Failed to load category:", err);
    } finally {
      setLoadingSlug(null);
    }
  };

  if (categories.length === 0) return null;

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              Popular Games
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Top up your favorite games and enjoy.
            </p>
          </div>
          <Link
            href="/games"
            className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition shrink-0 ml-3"
          >
            View All
          </Link>
        </div>

        {/* Horizontal Drag Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 select-none scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((cat) => {
            const isLoading = loadingSlug === cat.slug;
            return (
              <div key={cat.id} className="relative shrink-0">
                {isLoading && (
                  <div className="absolute inset-0 bg-bg-card/80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                )}
                <CategoryCard
                  category={cat}
                  onClick={() => handleCardClick(cat)}
                />
              </div>
            );
          })}
        </div>
      </section>

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