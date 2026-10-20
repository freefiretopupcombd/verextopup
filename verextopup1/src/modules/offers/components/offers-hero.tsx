import Link from "next/link";
import { Zap, Flame, Sparkles, Star, ArrowRight } from "lucide-react";

type TabId = "all" | "flash-sale" | "new-arrivals" | "featured";

const TAB_CONFIG: Record<
  TabId,
  {
    title: string;
    subtitle: string;
    icon: any;
    gradient: string;
    accent: string;
  }
> = {
  all: {
    title: "All Offers",
    subtitle: "সব discount এবং special deals এক জায়গায়",
    icon: Zap,
    gradient: "from-primary/20 via-bg-card to-bg-card",
    accent: "#7C3AED",
  },
  "flash-sale": {
    title: "⚡ Flash Sale",
    subtitle: "30%+ discount — সীমিত সময়ের জন্য!",
    icon: Flame,
    gradient: "from-orange-500/20 via-bg-card to-bg-card",
    accent: "#F97316",
  },
  "new-arrivals": {
    title: "✨ New Arrivals",
    subtitle: "সদ্য যোগ হওয়া নতুন product সমূহ",
    icon: Sparkles,
    gradient: "from-emerald-500/20 via-bg-card to-bg-card",
    accent: "#10B981",
  },
  featured: {
    title: "⭐ Featured Products",
    subtitle: "সবচেয়ে popular এবং trending product",
    icon: Star,
    gradient: "from-yellow-500/20 via-bg-card to-bg-card",
    accent: "#EAB308",
  },
};

export function OffersHero({
  tab,
  totalCount,
}: {
  tab: TabId;
  totalCount: number;
}) {
  const config = TAB_CONFIG[tab];
  const Icon = config.icon;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${config.gradient} p-6 sm:p-10 mb-6`}
    >
      {/* Decorative glow */}
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-30"
        style={{ backgroundColor: config.accent }}
      />

      <div className="relative">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 border"
          style={{
            backgroundColor: `${config.accent}20`,
            borderColor: `${config.accent}50`,
            color: config.accent,
          }}
        >
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {totalCount} Products
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-text-primary leading-tight mb-2">
          {config.title}
        </h1>

        <p className="text-text-muted text-sm sm:text-base max-w-lg">
          {config.subtitle}
        </p>
      </div>
    </section>
  );
}