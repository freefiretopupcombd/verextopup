import Link from "next/link";
import { 
  Zap, ShieldCheck, BadgeCheck, Globe, Star, Flame, 
  TrendingUp, Crown, Sparkles, Rocket, Gift, Heart, 
  ThumbsUp, Award, CheckCircle2, Clock, Users, Tag, Percent 
} from "lucide-react";

import type { RenderedSection, SectionProduct } from "../types";

// ==================================================
// SECTION RENDERER
// ==================================================
export function SectionRenderer({ section }: { section: RenderedSection }) {
  if (section.products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-4">
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
// CAROUSEL LAYOUT
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

// 🎨 HELPER: BADGE COLORS & ICONS
function getBadgeColorClasses(color?: string | null) {
  // 👇 মোবাইলে আরও ছোট করার জন্য টেক্সট সাইজ text-[7px] এবং প্যাডিং px-1 py-0.5 করা হয়েছে
  const baseStyle = "text-[7px] sm:text-[10px] font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded sm:rounded-md shadow-sm backdrop-blur-md whitespace-nowrap inline-flex items-center gap-0.5 sm:gap-1";
  
  switch (color) {
    case "success": return `${baseStyle} bg-emerald-500/90 text-white border border-emerald-400/50 shadow-emerald-500/30`;
    case "warning": return `${baseStyle} bg-amber-500/90 text-white border border-amber-400/50 shadow-amber-500/30`;
    case "danger": return `${baseStyle} bg-rose-500/90 text-white border border-rose-400/50 shadow-rose-500/30`;
    case "info": return `${baseStyle} bg-blue-500/90 text-white border border-blue-400/50 shadow-blue-500/30`;
    case "neutral": return `${baseStyle} bg-gray-600/90 text-white border border-gray-500/50 shadow-gray-500/30`;
    case "primary":
    default: return `${baseStyle} bg-primary/90 text-white border border-primary/50 shadow-primary/30`;
  }
}

function getBadgeIcon(iconName?: string | null) {
  const icons: Record<string, any> = {
    Zap, ShieldCheck, BadgeCheck, Globe, Star, Flame, TrendingUp, Crown, Sparkles, Rocket, Gift, Heart, ThumbsUp, Award, CheckCircle2, Clock, Users, Tag, Percent
  };
  const IconComponent = iconName ? icons[iconName] : Zap; 
  if (!IconComponent) return null;
  return <IconComponent className="w-3 h-3 fill-current" />;
}

// ==================================================
// GRID PRODUCT CARD
// ==================================================
function GridProductCard({ product }: { product: SectionProduct }) {
  const actionLabel = getActionLabel(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col items-center bg-bg-card border border-border rounded-2xl p-2 sm:p-4 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-primary/10 via-bg-secondary to-bg-card border border-border/50">
        
        {/* 🔥 BADGE (Fixed for Mobile Top-Right Corner) 🔥 */}
        {product.badge1Text && (
          // 👇 top-1 right-1 দিয়ে মোবাইলে একদম কোণায় বসানো হয়েছে
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-30 max-w-[95%]">
            <span className={`${getBadgeColorClasses(product.badge1Color)}`}>
              {/* 👇 মোবাইলে আইকন আরও ছোট হবে */}
              <span className="[&>svg]:w-2 [&>svg]:h-2 sm:[&>svg]:w-3.5 sm:[&>svg]:h-3.5 flex-shrink-0">
                {getBadgeIcon(product.badge1Icon)}
              </span>
              <span className="leading-none uppercase tracking-wide truncate">
                {product.badge1Text}
              </span>
            </span>
          </div>
        )}

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

      <h3 className="text-xs sm:text-sm font-bold text-text-primary text-center line-clamp-2 leading-tight mb-3 min-h-[2.5rem] flex items-center justify-center px-1">
        {product.name}
      </h3>

      <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-primary text-white text-[10px] sm:text-xs font-bold shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300 whitespace-nowrap">
        {actionLabel}
      </span>
    </Link>
  );
}

// ==================================================
// SUBSCRIPTION CARD
// ==================================================
function SubscriptionCard({ product }: { product: SectionProduct }) {
  const price = product.salePrice ?? product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col items-center bg-bg-card border border-border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3">
        {/* Badge for subscription card as well */}
        {product.badge1Text && (
          <div className="absolute top-1.5 right-1.5 z-20">
            <span className={`inline-flex items-center gap-1 border backdrop-blur-md text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm uppercase tracking-wider ${getBadgeColorClasses(product.badge1Color)}`}>
              {getBadgeIcon(product.badge1Icon)}
              {product.badge1Text}
            </span>
          </div>
        )}
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

      <h3 className="text-[11px] sm:text-sm font-bold text-text-primary text-center line-clamp-2 leading-tight mb-0.5 sm:mb-1">
        {product.name}
      </h3>

      {product.categoryName && (
        <p className="text-[9px] sm:text-[11px] text-text-muted text-center line-clamp-1 mb-1.5 sm:mb-2">
          {product.categoryName}
        </p>
      )}

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
        
        {/* Badge for list card */}
        {product.badge1Text && (
          <div className="absolute top-1 left-1 z-20">
            <span className={`inline-flex items-center gap-1 border backdrop-blur-md text-[8px] font-bold px-1 py-0.5 rounded shadow-sm uppercase tracking-wider ${getBadgeColorClasses(product.badge1Color)}`}>
              {product.badge1Text}
            </span>
          </div>
        )}

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