import Link from "next/link";
import {
  CreditCard,
  Wallet,
  ShoppingBag,
  User,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export function FaqCategories({ isLoggedIn }: { isLoggedIn: boolean }) {
  const categories = [
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Payment verify, refund, payment methods",
      slug: "payment",
      color: "primary",
      articleCount: 12,
    },
    {
      icon: Wallet,
      title: "Wallet & Balance",
      description: "Top-up, withdraw, balance issues",
      slug: "wallet",
      color: "success",
      articleCount: 8,
    },
    {
      icon: ShoppingBag,
      title: "Orders & Delivery",
      description: "Order status, delivery time, cancel",
      slug: "orders",
      color: "accent",
      articleCount: 15,
    },
    {
      icon: User,
      title: "Account & Login",
      description: "Password reset, 2FA, account security",
      slug: "account",
      color: "warning",
      articleCount: 10,
    },
    {
      icon: AlertCircle,
      title: "Problems & Errors",
      description: "Bug report, error solutions",
      slug: "errors",
      color: "danger",
      articleCount: 6,
    },
    {
      icon: ShieldCheck,
      title: "Safety & Security",
      description: "Fraud prevention, safe transactions",
      slug: "security",
      color: "info",
      articleCount: 7,
    },
  ];

  // Build callback URL based on category
  const buildHref = (slug: string) => {
    if (isLoggedIn) {
      // Logged in → go to support ticket list filtered by category
      return `/account/support?category=${slug}`;
    }
    // Not logged in → login with callback
    return `/login?callbackUrl=${encodeURIComponent(
      `/account/support?category=${slug}`
    )}`;
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          Browse by Category
        </h2>
        <p className="text-text-muted text-sm mt-1">
          আপনার সমস্যার category বেছে নিন
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const colors = {
            primary: "bg-primary/10 text-primary group-hover:bg-primary/20",
            success: "bg-success/10 text-success group-hover:bg-success/20",
            accent: "bg-accent/10 text-accent group-hover:bg-accent/20",
            warning: "bg-warning/10 text-warning group-hover:bg-warning/20",
            danger: "bg-danger/10 text-danger group-hover:bg-danger/20",
            info: "bg-info/10 text-info group-hover:bg-info/20",
          };

          return (
            <Link
              key={cat.slug}
              href={buildHref(cat.slug)}
              className="group bg-bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition flex items-start gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${colors[cat.color as keyof typeof colors]} flex items-center justify-center shrink-0 transition group-hover:scale-110`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-text-primary text-sm">
                    {cat.title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0" />
                </div>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {cat.description}
                </p>
                <div className="text-[10px] text-text-dim mt-2 font-medium">
                  {cat.articleCount} articles
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}