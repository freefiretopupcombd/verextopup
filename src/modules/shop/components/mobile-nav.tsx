"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  X,
  Home,
  Gamepad2,
  Gift,
  Tv,
  Flame,
  BookOpen,
  Headphones,
  Zap,
  User as UserIcon,
  ShoppingBag,
  Wallet,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Loader2,
  ChevronRight,
} from "lucide-react";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
} | null;

const mainNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/categories/top-up", label: "Top Up", icon: Zap },
  { href: "/categories/gift-cards", label: "Gift Cards", icon: Gift },
  { href: "/categories/subscriptions", label: "Subscriptions", icon: Tv },
  { href: "/offers", label: "Offers", icon: Flame },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/support", label: "Support", icon: Headphones },
];

const accountNav = [
  { href: "/account", label: "My Account", icon: UserIcon },
  { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/account/wallet", label: "Wallet", icon: Wallet },
];

export function MobileNav({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: SessionUser;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleLogout = () => {
    startTransition(async () => {
      await signOut({ callbackUrl: "/" });
    });
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const initial = user
    ? (user.name || user.email || "U").charAt(0).toUpperCase()
    : "U";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-bg-secondary border-r border-border z-[70] transform transition-transform duration-300 lg:hidden flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        {/* ==================
            Header (Logo + Close)
            ================== */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">Verex</span>
              <span className="text-text-primary">TopUp</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-card active:scale-95 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        {/* ==================
            User Card OR Login/Register
            ================== */}
        <div className="p-4 border-b border-border shrink-0">
          {user ? (
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-card hover:bg-bg-card/70 transition group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-text-primary text-sm truncate">
                  {user.name || "User"}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {user.email}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition shrink-0" />
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-bg-card transition"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-semibold transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </div>
          )}
        </div>

        {/* ==================
            Menu (scrollable)
            ================== */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* SHOP section */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 px-2">
              Shop
            </h3>
            <div className="space-y-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-text-primary hover:bg-bg-card"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ACCOUNT section (if logged in) */}
          {user && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 px-2">
                Account
              </h3>
              <div className="space-y-0.5">
                {accountNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        active
                          ? "bg-primary text-white shadow-sm"
                          : "text-text-primary hover:bg-bg-card"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                      )}
                    </Link>
                  );
                })}

                {/* Admin Panel */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span className="flex-1">Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* ==================
            Footer (Logout)
            ================== */}
        {user && (
          <div className="p-3 border-t border-border shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}