"use client";

import type { HomepageCategory } from "../queries";

export function CategoryCard({
  category,
  onClick,
}: {
  category: HomepageCategory;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // 👇 gap-2 থেকে gap-1.5 করা হয়েছে
      className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-xl"
      aria-label={`View products in ${category.name}`}
    >
      {/* Image container */}
      <div className="relative w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-bg-secondary border border-border/60 group-hover:border-primary/60 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-0.5 transition-all duration-300">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : category.icon ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl sm:text-4xl">{category.icon}</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl sm:text-4xl">🎮</span>
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-[11px] sm:text-xs font-semibold text-text-primary text-center line-clamp-2 leading-tight max-w-[100px] group-hover:text-primary transition">
        {category.name}
      </span>
    </button>
  );
}