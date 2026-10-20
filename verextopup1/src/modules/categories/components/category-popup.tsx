"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Flame, X } from "lucide-react";

import type { CategoryWithProducts } from "../queries";

// ==================================================
// CATEGORY POPUP
// ==================================================
// Layout:
//   - Mobile (< sm): 3 cols, VERTICAL card (icon top)
//   - Desktop (≥ sm): 3 cols, HORIZONTAL card (icon left)
// ==================================================
export function CategoryPopup({
  category,
  onClose,
}: {
  category: CategoryWithProducts;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Products in ${category.name}`}
    >
      <div
        className="relative bg-[#0b1020] border border-[#1e2537] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-[#1e2537] shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {category.name}
            </h2>
            <p className="text-xs text-[#8a90a8] mt-0.5">
              {category.productsCount}{" "}
              {category.productsCount === 1 ? "product" : "products"} available
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#151b2e] hover:bg-[#1e2537] border border-[#1e2537] text-[#8a90a8] hover:text-white transition flex items-center justify-center shrink-0"
            aria-label="Close popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Grid — 3 cols both mobile & desktop */}
        <div className="overflow-y-auto p-3 sm:p-5">
          {category.products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🎮</div>
              <p className="text-[#8a90a8] text-sm">
                এই category-তে এখনো কোনো product নেই
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {category.products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx + 1}
                  onNavigate={onClose}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================================================
// PRODUCT CARD — Responsive layout
// ==================================================
// Mobile: Vertical (flex-col) — icon top, content below
// Desktop: Horizontal (flex-row) — icon left, content right
// ==================================================
function ProductCard({
  product,
  index,
  onNavigate,
}: {
  product: CategoryWithProducts["products"][number];
  index: number;
  onNavigate: () => void;
}) {
  const discount = product.salePrice
    ? Math.round(
        ((product.price - product.salePrice) / product.price) * 100
      )
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={onNavigate}
      className="group relative flex flex-col sm:flex-row sm:items-start gap-0 sm:gap-3 bg-[#0e1425] border border-[#1e2537] rounded-xl p-2 sm:p-3 hover:border-[#8b5cf6]/50 hover:bg-[#101830] transition-all duration-200 overflow-hidden"
    >
      {/* ============================================
          Rank badge — top-right of card
          ============================================ */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-[#8b5cf6] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-md z-10">
        #{index}
      </div>

      {/* ============================================
          Icon
          - Mobile: full-width square
          - Desktop: 56x56 fixed
          ============================================ */}
      <div className="relative w-full sm:w-14 sm:h-14 shrink-0 mb-2 sm:mb-0">
        <div className="w-full aspect-square sm:w-14 sm:h-14 sm:aspect-auto rounded-lg bg-gradient-to-br from-[#1e1b3a] to-[#0e1425] border border-[#2a2740] flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform duration-200">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : product.icon ? (
            <span className="text-3xl sm:text-2xl">{product.icon}</span>
          ) : (
            <span className="text-3xl sm:text-2xl">🎮</span>
          )}
        </div>
      </div>

      {/* ============================================
          Content
          ============================================ */}
      <div className="flex-1 min-w-0 sm:pr-5 w-full">
        {/* Title */}
        <h3 className="text-[11px] sm:text-sm font-bold text-white line-clamp-2 leading-tight mb-1.5 sm:mb-1.5 group-hover:text-[#a78bfa] transition px-0.5 sm:px-0">
          {product.name}
        </h3>

        {/* Tag */}
        <div className="flex flex-wrap items-center gap-1 mb-1.5 px-0.5 sm:px-0">
          {discount > 0 ? (
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-[#064e3b]/60 text-[#34d399] font-bold px-1.5 py-0.5 rounded">
              <Flame className="w-2.5 h-2.5" />
              Save {discount}%
            </span>
          ) : product.isFeatured ? (
            <span className="inline-flex items-center text-[9px] sm:text-[10px] bg-[#3b0764]/60 text-[#c084fc] font-bold px-1.5 py-0.5 rounded">
              Best Deal
            </span>
          ) : (
            <span className="inline-flex items-center text-[9px] sm:text-[10px] bg-[#1e293b] text-[#94a3b8] font-bold px-1.5 py-0.5 rounded">
              Direct
            </span>
          )}
        </div>

        {/* Bottom row — Top Seller + Arrow */}
        <div className="flex items-center justify-between gap-1 mt-auto sm:mt-2 pt-1 px-0.5 sm:px-0">
          <div className="flex items-center gap-1 min-w-0">
            <span
              className="w-1 h-1 rounded-full bg-[#8b5cf6] shrink-0"
              aria-hidden="true"
            />
            <span className="text-[9px] sm:text-[10px] text-[#8a90a8] font-medium truncate">
              Top Seller
            </span>
          </div>

          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#151b2e] border border-[#2a3148] flex items-center justify-center group-hover:bg-[#8b5cf6] group-hover:border-[#8b5cf6] transition-all duration-200 shrink-0">
            <ArrowRight className="w-3 h-3 text-[#8a90a8] group-hover:text-white transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}