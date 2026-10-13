"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { User, Wallet, ShoppingBag, Star, Shield } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "security", label: "Security", icon: Shield },
];

export function UserTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("tab") || "overview";

  const setTab = (id: string) => {
    const next = new URLSearchParams(params.toString());
    if (id === "overview") next.delete("tab");
    else next.set("tab", id);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-1.5 flex overflow-x-auto no-scrollbar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = current === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              active
                ? "bg-gradient-primary text-white"
                : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}