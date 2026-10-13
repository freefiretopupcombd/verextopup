import Link from "next/link";

import type { RenderedSection, SectionProduct } from "../types";

// ==================================================
// SECTION RENDERER — Pure Server Component
// ==================================================
export function SectionRenderer({ section }: { section: RenderedSection }) {
  if (section.products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-5 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              {section.subtitle}
            </p>
          )}
        </div>

        {section.viewAllUrl && (
          <Link
            href={section.viewAllUrl}
            className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition flex items-center gap-1 shrink-0 ml-3 px-3 py-2 rounded-lg border border-primary/30 hover:bg-primary/10"
          >
            {section.viewAllText}
            <span className="text-base">→</span>
          </Link>
        )}
      </div>

      {/* Layout */}
      {section.layoutType === "GRID" && <GridLayout section={section} />}
      {section.layoutType === "CAROUSEL" && <CarouselLayout section={section} />}
      {section.layoutType === "LIST" && (
        <ListLayout products={section.products} />
      )}
    </section>
  );
}

// ==================================================
// GRID LAYOUT
// ==================================================
function GridLayout({ section }: { section: RenderedSection }) {
  const mobileCols = section.mobileColumns ?? 2;
  const desktopCols = section.desktopColumns ?? 4;

  const inlineStyle = {
    "--mobile-cols": String(mobileCols),
    "--desktop-cols": String(desktopCols),
  } as React.CSSProperties;

  return (
    <div className="product-grid" style={inlineStyle}>
      {section.products.map((p) => (
        <GridProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// ==================================================
// CAROUSEL LAYOUT — Subscription-card style with row control
// ==================================================
function CarouselLayout({ section }: { section: RenderedSection }) {
  const mobileCols = section.mobileColumns ?? 3;
  const desktopCols = section.desktopColumns ?? 6;

  const inlineStyle = {
    "--mobile-cols": String(mobileCols),
    "--desktop-cols": String(desktopCols),
  } as React.CSSProperties;

  return (
    <div className="product-grid" style={inlineStyle}>
      {section.products.map((p) => (
        <SubscriptionCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// ==================================================
// LIST LAYOUT
// ==================================================
function ListLayout({ products }: { products: SectionProduct[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {products.map((p) => (
        <ListProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// ==================================================
// GRID PRODUCT CARD
// ==================================================
function GridProductCard({ product }: { product: SectionProduct }) {
  const actionLabel = getActionLabel(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col items-center bg-bg-card border border-border rounded-2xl p-3 sm:p-4 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-primary/10 via-bg-secondary to-bg-card border border-border/50">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/35 transition-all duration-500" />
        </div>

        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : product.icon ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <span className="text-5xl sm:text-6xl drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
              {product.icon}
            </span>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <span className="text-5xl sm:text-6xl drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
              🎮
            </span>
          </div>
        )}
      </div>

      <h3 className="text-xs sm:text-sm font-bold text-text-primary text-center line-clamp-2 leading-tight mb-3 min-h-[2.5rem] flex items-center justify-center">
        {product.name}
      </h3>

      <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-primary text-white text-xs font-bold shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300 whitespace-nowrap">
        {actionLabel}
      </span>
    </Link>
  );
}

// ==================================================
// SUBSCRIPTION CARD — Demo image style
// ==================================================
// Design:
//   ┌──────────────────┐
//   │   ╭────────╮     │
//   │   │  LOGO  │     │  ← Icon in rounded box with glow
//   │   ╰────────╯     │
//   │                  │
//   │    Netflix       │  ← Bold title (centered)
//   │    Streaming     │  ← Small muted subtitle
//   │                  │
//   │   ৳ 250.00      │  ← Price at bottom (centered)
//   └──────────────────┘
// ==================================================
function SubscriptionCard({ product }: { product: SectionProduct }) {
  const price = product.salePrice ?? product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col items-center bg-bg-card border border-border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Icon container — rounded square with colored background */}
      <div className="relative w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : product.icon ? (
          <div className="w-full h-full flex items-center justify-center text-3xl sm:text-5xl">
            {product.icon}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl sm:text-5xl">
            📺
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[11px] sm:text-sm font-bold text-text-primary text-center line-clamp-2 leading-tight mb-0.5 sm:mb-1">
        {product.name}
      </h3>

      {/* Subtitle (category name) */}
      {product.categoryName && (
        <p className="text-[9px] sm:text-[11px] text-text-muted text-center line-clamp-1 mb-1.5 sm:mb-2">
          {product.categoryName}
        </p>
      )}

      {/* Price at bottom */}
      <div className="mt-auto flex items-baseline gap-1 justify-center">
        <span className="text-[11px] sm:text-sm font-bold text-text-primary">
          ৳ {price.toFixed(2)}
        </span>
        {product.salePrice && (
          <span className="text-[9px] sm:text-[11px] text-text-muted line-through">
            ৳ {product.price.toFixed(2)}
          </span>
        )}
      </div>
    </Link>
  );
}

// ==================================================
// LIST PRODUCT CARD
// ==================================================
function ListProductCard({ product }: { product: SectionProduct }) {
  const actionLabel = getActionLabel(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex items-center gap-3 bg-bg-card border border-border rounded-2xl p-3 hover:border-primary/50 hover:shadow-lg transition-all"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-bg-secondary border border-border/50 flex items-center justify-center shrink-0">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : product.icon ? (
          <span className="text-2xl sm:text-3xl">{product.icon}</span>
        ) : (
          <span className="text-2xl sm:text-3xl">🎮</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-text-primary line-clamp-2 group-hover:text-primary transition">
          {product.name}
        </h3>
      </div>

      <div className="px-3 py-2 rounded-lg bg-gradient-primary text-white text-xs font-bold shrink-0 group-hover:shadow-lg transition whitespace-nowrap">
        {actionLabel}
      </div>
    </Link>
  );
}

// ==================================================
// ACTION LABEL
// ==================================================
function getActionLabel(product: SectionProduct): string {
  const name = product.name.toLowerCase();
  const category = (product.categoryName || "").toLowerCase();

  if (name.includes("gift") || category.includes("gift")) {
    return "Buy Now";
  }
  if (
    name.includes("top up") ||
    name.includes("topup") ||
    category.includes("top up") ||
    category.includes("topup")
  ) {
    return "Top Up";
  }
  if (category.includes("subscription")) {
    return "Subscribe";
  }
  return "Buy Now";
}