import Link from "next/link";
import {
  Home,
  Search,
  ShoppingBag,
  Headphones,
  ArrowLeft,
  Compass,
  Package,
} from "lucide-react";

import { getSession } from "@/lib/auth/session";

export default async function NotFound() {
  const session = await getSession();
  const isLoggedIn = !!session?.user;
  const isAdmin =
    (session?.user as any)?.role === "ADMIN" ||
    (session?.user as any)?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Big 404 with gradient */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-[120px] sm:text-[180px] font-black leading-none bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent select-none">
              404
            </h1>
            {/* Floating icons */}
            <Compass className="absolute -top-4 -left-6 w-8 h-8 text-primary/60 animate-bounce [animation-duration:3s]" />
            <Package className="absolute -bottom-2 -right-8 w-7 h-7 text-accent/60 animate-bounce [animation-duration:4s]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-2">
            Page Not Found
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2 max-w-md mx-auto">
            দুঃখিত! যে পেজটা খুঁজছিলেন সেটা পাওয়া যায়নি। হয়তো link টা ভুল,
            অথবা পেজটা সরিয়ে ফেলা হয়েছে।
          </p>
        </div>

        {/* Search bar */}
        <form
          action="/search"
          method="GET"
          className="bg-bg-card border border-border rounded-xl p-2 flex items-center gap-2 max-w-lg mx-auto mb-6"
        >
          <Search className="w-4 h-4 text-text-muted ml-2 shrink-0" />
          <input
            type="text"
            name="q"
            placeholder="Product, game, বা কিছু search করুন..."
            className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
          />
          <button
            type="submit"
            className="bg-gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Search
          </button>
        </form>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          <QuickLink
            href="/"
            icon={Home}
            label="Home"
            description="হোমপেজে ফিরুন"
          />
          <QuickLink
            href="/products"
            icon={ShoppingBag}
            label="Products"
            description="সব product দেখুন"
          />
          <QuickLink
            href="/support"
            icon={Headphones}
            label="Support"
            description="সাহায্য দরকার?"
          />
          <QuickLink
            href={isLoggedIn ? "/account" : "/login"}
            icon={isLoggedIn ? Compass : ArrowLeft}
            label={isLoggedIn ? "Account" : "Login"}
            description={isLoggedIn ? "আপনার account" : "Sign in করুন"}
          />
        </div>

        {/* Admin shortcut (only if admin) */}
        {isAdmin && (
          <div className="text-center mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-primary transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Admin Panel এ যান
            </Link>
          </div>
        )}

        {/* Back button */}
        <div className="text-center">
          <BackButton />
        </div>

        {/* Bottom note */}
        <p className="text-center text-[11px] text-text-dim mt-10">
          Error code: 404 · Page not found
        </p>
      </div>
    </div>
  );
}

// ==================================================
// QUICK LINK CARD
// ==================================================
function QuickLink({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: any;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 transition text-center"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm font-bold text-text-primary">{label}</div>
      <div className="text-[10px] text-text-muted mt-0.5 leading-tight">
        {description}
      </div>
    </Link>
  );
}

// ==================================================
// BACK BUTTON (client component)
// ==================================================
import { BackButton } from "@/components/ui/back-button";