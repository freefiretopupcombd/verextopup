"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingBag,
  Users,
  Wallet,
  Star,
  Percent,
  CreditCard,
  Settings,
  FileText,
  Search,
  BarChart3,
  Shield,
  Headphones,
  Image,
  Bell,
  LayoutGrid,
  MessageCircle,    // ← ✅ এটা missing ছিল
  Smartphone,       // ← ✅ এটাও দরকার PWA link এর জন্য
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/products", label: "Products", icon: Package },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/payments", label: "Payment Methods", icon: CreditCard },
      { href: "/admin/coupons", label: "Coupons", icon: Percent },
    ],
  },
  {
  title: "Users",
  items: [
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/wallets", label: "Wallets", icon: Wallet },
  ],
},
  {
    title: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage Sections", icon: LayoutGrid },
      { href: "/admin/hero-slider", label: "Hero Slider", icon: Image },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/support", label: "Support", icon: Headphones },
      { href: "/admin/support/widget", label: "Support Widget", icon: MessageCircle },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
  title: "System",
  items: [
    { href: "/admin/settings/seo", label: "SEO", icon: Search },
    { href: "/admin/settings/pwa", label: "PWA & App", icon: Smartphone },   // ✅ নতুন
    { href: "/admin/security", label: "Security", icon: Shield },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
},
];

export function AdminSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden sticky top-20">
      {/* User info */}
      <div className="p-4 bg-bg-secondary border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-text-primary text-sm truncate">
              {userName}
            </div>
            <div className="text-text-muted text-xs truncate">
              {userEmail}
            </div>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="p-3 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="text-[10px] font-semibold uppercase text-text-dim px-3 mb-1.5 tracking-wider">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      active
                        ? "bg-gradient-primary text-white font-medium"
                        : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}