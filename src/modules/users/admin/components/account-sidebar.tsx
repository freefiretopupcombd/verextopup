"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Shield,
  ShoppingBag,
  Wallet,
  Star,
  Headphones,
  Bell,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  labelBn: string;
  icon: LucideIcon;
  exact?: boolean;
};

const navItems: NavItem[] = [
  {
    href: "/account",
    label: "Overview",
    labelBn: "ড্যাশবোর্ড",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/account/orders",
    label: "Orders",
    labelBn: "অর্ডার",
    icon: ShoppingBag,
  },
  {
    href: "/account/wallet",
    label: "Wallet",
    labelBn: "ওয়ালেট",
    icon: Wallet,
  },
  {
    href: "/account/reviews",
    label: "Reviews",
    labelBn: "রিভিউ",
    icon: Star,
  },
  {
    href: "/account/notifications",
    label: "Notifications",
    labelBn: "নোটিফিকেশন",
    icon: Bell,
  },
  {
    href: "/account/profile",
    label: "Profile",
    labelBn: "প্রোফাইল",
    icon: User,
  },
  {
    href: "/account/security",
    label: "Security",
    labelBn: "নিরাপত্তা",
    icon: Shield,
  },
  {
    href: "/account/support",
    label: "Support",
    labelBn: "সাপোর্ট",
    icon: Headphones,
  },
];

export function AccountSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      {/* User info */}
      <div className="p-5 bg-bg-secondary border-b border-border">
        <div className="w-12 h-12 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-lg mb-3">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="font-semibold text-text-primary text-sm truncate">
          {userName}
        </div>
        <div className="text-text-muted text-xs truncate">
          {userEmail}
        </div>
      </div>

      {/* Nav */}
      <nav className="p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition mb-0.5 ${
                isActive
                  ? "bg-gradient-primary text-white font-medium"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.labelBn}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}