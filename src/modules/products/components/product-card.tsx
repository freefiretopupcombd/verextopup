"use client";

import Link from "next/link";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import { BadgeCheck } from "lucide-react";
import { DualPrice } from "@/modules/currency/components/dual-price";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  imageAlt?: string | null;
  icon: string | null;
  productType: string;
  category: { name: string; slug: string } | null;
  // ✅ Badge fields add kora hoyeche
  badge1Text?: string | null;
  badge1Icon?: string | null;
  badge1Color?: string | null;
  badge2Text?: string | null;
  badge2Icon?: string | null;
  badge2Color?: string | null;
  badge3Text?: string | null;
  badge3Icon?: string | null;
  badge3Color?: string | null;
  
  firstVariant: {
    name: string;
    price: number;
    salePrice: number | null;
  } | null;
  variantCount: number;
};

// 🎨 Color mapping function
function getBadgeStyle(color?: string | null) {
  switch (color) {
    case "success": return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    case "danger": return "bg-rose-500/15 text-rose-500 border-rose-500/30";
    case "warning": return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "info": return "bg-blue-500/15 text-blue-500 border-blue-500/30";
    case "neutral": return "bg-gray-500/15 text-gray-400 border-gray-500/30";
    case "primary":
    default: return "bg-primary/15 text-primary border-primary/30";
  }
}

// 🎨 Icon mapping function (Dynamic Lucide Icons)
function DynamicIcon({ name, className }: { name?: string | null, className?: string }) {
  if (!name || name === "") return null;
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <LucideIcons.Zap className={className} />; // Fallback
  return <IconComponent className={className} />;
}

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const price = product.firstVariant
    ? (product.firstVariant.salePrice ?? product.firstVariant.price)
    : 0;

  // Badge gulo array te rakhlam jate easily map kora jay
  const badges = [
    { text: product.badge1Text, icon: product.badge1Icon, color: product.badge1Color },
    { text: product.badge2Text, icon: product.badge2Icon, color: product.badge2Color },
    { text: product.badge3Text, icon: product.badge3Icon, color: product.badge3Color },
  ].filter(b => b.text); // Jodi text thake tobei show hobe

  return (
    <div className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block shrink-0">
        <div className="aspect-square bg-gradient-to-br from-primary/10 via-bg-secondary to-bg-card flex items-center justify-center overflow-hidden relative">
          
          {/* Left Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 bg-bg-primary/80 backdrop-blur border border-border text-[10px] font-medium text-text-secondary px-2 py-1 rounded">
              <BadgeCheck className="w-2.5 h-2.5 text-primary" />
              {formatType(product.productType)}
            </span>
          </div>

          {/* 🔥 RIGHT DYNAMIC BADGES (Admin controlled) 🔥 */}
          <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
            {badges.map((badge, index) => (
              <span 
                key={index}
                className={`inline-flex items-center gap-1 border backdrop-blur-md text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm uppercase tracking-wider ${getBadgeStyle(badge.color)}`}
              >
                <DynamicIcon name={badge.icon} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {badge.text}
              </span>
            ))}
          </div>

          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.imageAlt || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
              className="object-cover group-hover:scale-105 transition duration-300"
              priority={priority}
              quality={80}
            />
          ) : product.icon ? (
            <div className="text-5xl sm:text-6xl">{product.icon}</div>
          ) : (
            <div className="text-5xl sm:text-6xl">🎮</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-text-primary line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] leading-snug hover:text-primary transition">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <div className="text-[11px] text-text-muted mt-1 truncate">
            {product.category.name}
          </div>
        )}

        {/* Dual Price */}
        <div className="mt-2 mb-3 mt-auto">
          <DualPrice
            amountBDT={price}
            size="md"
            layout="stacked"
            className="!items-start"
            primaryClassName="text-text-primary"
          />
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="block w-full text-center bg-gradient-primary text-white text-xs font-semibold py-2 rounded-lg transition mt-auto"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}

export function formatType(type: string): string {
  const map: Record<string, string> = {
    TOPUP: "Top Up",
    GIFT_CARD: "Gift Card",
    SUBSCRIPTION: "Subscription",
    SERVICE: "Service",
  };
  return map[type] || type;
}