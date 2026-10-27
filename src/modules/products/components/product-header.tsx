"use client";

import * as Icons from "lucide-react";
import { Star, Zap, Globe, BadgeCheck } from "lucide-react";

// ==================================================
// ICON LOADER
// ==================================================
function getIcon(name: string | null | undefined) {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  return Icon || null;
}

// ==================================================
// BADGE COLOR STYLES
// ==================================================
const BADGE_STYLES: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary",
  },
  success: {
    bg: "bg-success/10",
    border: "border-success/20",
    text: "text-success",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    text: "text-warning",
  },
  danger: {
    bg: "bg-danger/10",
    border: "border-danger/20",
    text: "text-danger",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  neutral: {
    bg: "bg-bg-secondary",
    border: "border-border",
    text: "text-text-secondary",
  },
};

// ==================================================
// PRODUCT HEADER
// ==================================================
export function ProductHeader({
  name,
  categoryName,
  icon,
  thumbnail,
  imageAlt, //
  rating,
  reviewCount,
  region = "BD",
  soldCount = 0,
  badges = [],
}: {
  name: string;
  categoryName?: string | null;
  icon: string | null;
  thumbnail: string | null;
  imageAlt?: string | null; //
  rating: number;
  reviewCount: number;
  region?: string;
  soldCount?: number;
  badges?: {
    text: string | null;
    icon: string | null;
    color: string | null;
  }[];
}) {
  // Filter valid badges (must have text)
  const validBadges = badges.filter((b) => b.text && b.text.trim());

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-bg-card via-bg-card to-primary/10">
      {/* Soft glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative flex items-center gap-3 sm:gap-5 p-3 sm:p-5">
        {/* Image */}
        <div className="relative shrink-0">
          <div className="relative w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-bg-secondary border border-primary/30 shadow-lg shadow-primary/10">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={imageAlt || name}
                className="w-full h-full object-cover"
              />
            ) : icon ? (
              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">
                {icon}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">
                🎮
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Category */}
          {categoryName && (
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
              {categoryName}
            </div>
          )}

          {/* Name */}
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-text-primary leading-tight line-clamp-2">
            {name}
          </h1>

          {/* Rating + sold */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-xs font-semibold text-text-primary">
                  {rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-text-muted">
                  ({reviewCount})
                </span>
              </div>
            )}
            {soldCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-text-dim" />
                <span className="text-[10px] text-text-muted">
                  {soldCount.toLocaleString()}+ sold
                </span>
              </>
            )}
          </div>

          {/* Dynamic Badges */}
          {validBadges.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {validBadges.map((badge, idx) => {
                const color = badge.color || "neutral";
                const styles = BADGE_STYLES[color] || BADGE_STYLES.neutral;
                const BadgeIcon = getIcon(badge.icon);

                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-medium ${styles.text} ${styles.bg} border ${styles.border} px-1.5 py-0.5 rounded`}
                  >
                    {BadgeIcon ? (
                      <BadgeIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-current" />
                    )}
                    {badge.text}
                  </span>
                );
              })}
            </div>
          )}

          {/* Fallback badges when none configured */}
          {validBadges.length === 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                <Zap className="w-2.5 h-2.5" />
                Instant
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded">
                <Globe className="w-2.5 h-2.5" />
                {region}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-text-secondary bg-bg-secondary border border-border px-1.5 py-0.5 rounded">
                <BadgeCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}