import type { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  Search,
  Settings as SettingsIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Settings — Admin",
  robots: { index: false, follow: false },
};

const settingsItems = [
  {
    href: "/admin/settings/currency",
    icon: DollarSign,
    title: "Currency",
    description: "Exchange rate এবং multi-currency settings",
  },
  {
    href: "/admin/settings/seo",
    icon: Search,
    title: "SEO",
    description:
      "Site metadata, Organization schema, social links, analytics",
  },
  // Future: General, Email, Security, etc.
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-content">Settings</h1>
        <p className="text-content-muted text-sm mt-1">
          Site configuration
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-card rounded-xl shadow-card border border-border p-5 hover:shadow-card-hover transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-content">{item.title}</h3>
              <p className="text-sm text-content-muted mt-1">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}