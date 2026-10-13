"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Home,
  Gamepad2,
  Zap,
  Gift,
  Tv,
  BookOpen,
  Headphones,
  Flame,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  dropdown?: {
    sections: {
      title: string;
      items: { href: string; label: string; badge?: string }[];
    }[];
  };
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    exact: true,
  },
  {
    href: "/games",
    label: "Games",
    dropdown: {
      sections: [
        {
          title: "Popular Games",
          items: [
            { href: "/games/free-fire", label: "Free Fire", badge: "Hot" },
            { href: "/games/pubg-mobile", label: "PUBG Mobile" },
            { href: "/games/mobile-legends", label: "Mobile Legends" },
            { href: "/games/genshin-impact", label: "Genshin Impact" },
          ],
        },
        {
          title: "Browse",
          items: [
            { href: "/games", label: "All Games" },
            { href: "/categories/top-up", label: "Game Top-Up" },
            { href: "/categories/gift-cards", label: "Gift Cards" },
          ],
        },
      ],
    },
  },
  {
    href: "/categories/top-up",
    label: "Top Up",
  },
  {
    href: "/categories/gift-cards",
    label: "Gift Cards",
  },
  {
    href: "/categories/subscriptions",
    label: "Subscriptions",
  },
  {
    href: "/offers",
    label: "Offers",
    dropdown: {
      sections: [
        {
          title: "Promotions",
          items: [
            { href: "/offers/flash-sale", label: "Flash Sale", badge: "Live" },
            { href: "/offers/new-arrivals", label: "New Arrivals" },
            { href: "/offers/featured", label: "Featured Deals" },
          ],
        },
      ],
    },
  },
  {
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/support",
    label: "Support",
  },
];

export function CategoryNav() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav
      className="flex items-center gap-0.5 h-16"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const hasDropdown = !!item.dropdown;

        return (
          <div
            key={item.href}
            className="relative"
            onMouseEnter={() => hasDropdown && setOpenDropdown(item.href)}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              href={item.href}
              className={`flex items-center gap-1 px-2.5 py-2 text-[13px] font-medium rounded-md transition whitespace-nowrap relative ${
                active
                  ? "text-primary"
                  : "text-text-secondary hover:text-primary hover:bg-bg-card/50"
              }`}
            >
              {item.label}
              {hasDropdown && (
                <ChevronDown
                  className={`w-3 h-3 opacity-50 transition-transform ${
                    openDropdown === item.href ? "rotate-180" : ""
                  }`}
                />
              )}

              {/* Active indicator */}
              {active && (
                <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            {/* Dropdown */}
            {hasDropdown && openDropdown === item.href && (
              <div
                className="absolute top-full left-0 pt-1 z-50"
                onMouseEnter={() => setOpenDropdown(item.href)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[480px] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="grid grid-cols-2">
                    {item.dropdown!.sections.map((section, idx) => (
                      <div
                        key={section.title}
                        className={`p-4 ${
                          idx > 0 ? "border-l border-border" : ""
                        }`}
                      >
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2.5">
                          {section.title}
                        </h4>
                        <ul className="space-y-0.5">
                          {section.items.map((subItem) => (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className="flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg text-[13px] text-text-primary hover:bg-bg-secondary hover:text-primary transition group"
                              >
                                <span className="group-hover:translate-x-0.5 transition-transform">
                                  {subItem.label}
                                </span>
                                {subItem.badge && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      subItem.badge === "Hot" ||
                                      subItem.badge === "Live"
                                        ? "bg-danger/15 text-danger"
                                        : "bg-primary/15 text-primary"
                                    }`}
                                  >
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}