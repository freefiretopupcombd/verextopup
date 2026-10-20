"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search as SearchIcon, X } from "lucide-react";

import { NotificationBell } from "@/modules/notifications/components/notification-bell";
import { CurrencyToggle } from "@/modules/currency/components/currency-toggle";
import { SearchBar } from "./search-bar";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";
import { CategoryNav } from "./category-nav";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
} | null;

export function Header({
  user,
  unreadCount = 0,
  seoSettings,
}: {
  user: SessionUser;
  unreadCount?: number;
  seoSettings: {
    brandNamePart1: string;
    brandNamePart2: string;
  };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [searchOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-200 ${
          scrolled
            ? "bg-bg-secondary/95 backdrop-blur-lg border-border shadow-sm"
            : "bg-bg-secondary border-border"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className={`flex items-center gap-2 lg:gap-3 transition-all ${
              scrolled ? "h-14" : "h-16"
            }`}
          >
            {/* LEFT — Hamburger + Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-bg-card active:scale-95 transition shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-text-primary" />
              </button>

              <Link
                href="/"
                className="flex items-center gap-1.5 shrink-0 group"
                aria-label={`${seoSettings.brandNamePart1}${seoSettings.brandNamePart2} Home`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                  <span className="text-white font-black text-sm">
                    {seoSettings.brandNamePart1.charAt(0)}
                  </span>
                </div>
                <span className="hidden xs:inline text-lg font-bold tracking-tight">
                  <span className="text-primary">
                    {seoSettings.brandNamePart1}
                  </span>
                  <span className="text-text-primary">
                    {seoSettings.brandNamePart2}
                  </span>
                </span>
              </Link>
            </div>

            {/* CENTER — Category nav */}
            <div className="hidden lg:flex flex-1 justify-center min-w-0">
              <CategoryNav />
            </div>

            {/* RIGHT — Actions */}
            <div className="ml-auto lg:ml-0 flex items-center gap-0.5 sm:gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-bg-card active:scale-95 transition shrink-0"
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5 text-text-primary" />
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-bg-card active:scale-95 transition"
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5 text-text-primary" />
              </button>

              <CurrencyToggle />

              {user && <NotificationBell unreadCount={unreadCount} />}

              <UserMenu user={user} />
            </div>
          </div>
        </div>

        {/* Expandable search */}
        {searchOpen && (
          <div
            ref={searchRef}
            className="border-t border-border bg-bg-secondary/95 backdrop-blur-lg"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar variant="desktop" />
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-bg-card active:scale-95 transition shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        unreadCount={unreadCount}
      />
    </>
  );
}