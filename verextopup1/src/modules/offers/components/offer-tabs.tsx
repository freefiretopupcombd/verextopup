import Link from "next/link";
import { Zap, Flame, Sparkles, Star } from "lucide-react";

type TabId = "all" | "flash-sale" | "new-arrivals" | "featured";

const TABS: {
  id: TabId;
  label: string;
  href: string;
  icon: any;
  color: string;
}[] = [
  {
    id: "all",
    label: "All Offers",
    href: "/offers",
    icon: Zap,
    color: "#7C3AED",
  },
  {
    id: "flash-sale",
    label: "Flash Sale",
    href: "/offers/flash-sale",
    icon: Flame,
    color: "#F97316",
  },
  {
    id: "new-arrivals",
    label: "New Arrivals",
    href: "/offers/new-arrivals",
    icon: Sparkles,
    color: "#10B981",
  },
  {
    id: "featured",
    label: "Featured",
    href: "/offers/featured",
    icon: Star,
    color: "#EAB308",
  },
];

export function OfferTabs({
  current,
  counts,
}: {
  current: TabId;
  counts: {
    all: number;
    flashSale: number;
    newArrivals: number;
    featured: number;
  };
}) {
  const getCount = (id: TabId) => {
    switch (id) {
      case "all":
        return counts.all;
      case "flash-sale":
        return counts.flashSale;
      case "new-arrivals":
        return counts.newArrivals;
      case "featured":
        return counts.featured;
    }
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = current === tab.id;
        const count = getCount(tab.id);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              active
                ? "text-white shadow-md"
                : "text-text-secondary hover:bg-bg-secondary"
            }`}
            style={
              active
                ? {
                    backgroundColor: tab.color,
                    boxShadow: `0 4px 12px -2px ${tab.color}66`,
                  }
                : undefined
            }
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                active ? "bg-white/20" : "bg-bg-secondary"
              }`}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}