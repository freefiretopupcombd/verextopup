"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User as UserIcon,
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  LogOut,
  ChevronDown,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
} | null;

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await signOut({ callbackUrl: "/" });
    });
  };

  if (!user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/login"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary rounded-lg hover:bg-bg-card transition"
        >
          <LogIn className="w-4 h-4" />
          Login
        </Link>
        <Link
          href="/register"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:shadow-md hover:shadow-primary/25 transition"
        >
          <UserPlus className="w-4 h-4" />
          Register
        </Link>

        <Link
          href="/login"
          className="sm:hidden p-2 rounded-lg hover:bg-bg-card transition"
          aria-label="Login"
        >
          <LogIn className="w-5 h-5 text-text-primary" />
        </Link>
      </div>
    );
  }

  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-bg-card transition"
        aria-label="User menu"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {initial}
        </div>
        <ChevronDown
          className={`hidden sm:block w-3.5 h-3.5 text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border bg-bg-secondary/50">
            <div className="flex items-center gap-3">
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
            </div>
          </div>

          <div className="p-1.5">
            <MenuLink
              href="/account"
              icon={UserIcon}
              label="My Account"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/account/orders"
              icon={ShoppingBag}
              label="My Orders"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/account/wallet"
              icon={Wallet}
              label="Wallet"
              onClick={() => setOpen(false)}
            />

            {isAdmin && (
              <>
                <div className="my-1.5 border-t border-border" />
                <MenuLink
                  href="/admin"
                  icon={LayoutDashboard}
                  label="Admin Panel"
                  onClick={() => setOpen(false)}
                  accent
                />
              </>
            )}
          </div>

          <div className="p-1.5 border-t border-border">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  href: string;
  icon: any;
  label: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
        accent
          ? "text-primary hover:bg-primary/10"
          : "text-text-primary hover:bg-bg-secondary"
      }`}
    >
      <Icon className="w-4 h-4 opacity-70" />
      {label}
    </Link>
  );
}