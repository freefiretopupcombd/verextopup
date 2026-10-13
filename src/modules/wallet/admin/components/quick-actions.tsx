import Link from "next/link";
import { Users, Clock, ArrowRightLeft, Plus } from "lucide-react";

export function QuickActions({
  pendingCount,
}: {
  pendingCount: number;
}) {
  const actions = [
    {
      href: "/admin/wallets/users",
      icon: Users,
      label: "Manage Users",
      description: "User wallets দেখুন, balance adjust করুন",
      color: "primary",
    },
    {
      href: "/admin/wallets/topups",
      icon: Clock,
      label: "Pending Top-Ups",
      description: "User-দের top-up request approve/reject করুন",
      color: "warning",
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      href: "/admin/wallets/transactions",
      icon: ArrowRightLeft,
      label: "All Transactions",
      description: "সব wallet transaction এক জায়গায়",
      color: "success",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        const colors = {
          primary: "bg-primary/10 text-primary",
          warning: "bg-warning/10 text-warning",
          success: "bg-success/10 text-success",
        };

        return (
          <Link
            key={action.href}
            href={action.href}
            className="bg-bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition group relative"
          >
            {action.badge != null && action.badge > 0 && (
              <span className="absolute top-3 right-3 bg-warning text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {action.badge}
              </span>
            )}
            <div
              className={`w-10 h-10 rounded-lg ${colors[action.color as keyof typeof colors]} flex items-center justify-center mb-3 group-hover:scale-110 transition`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="font-bold text-text-primary text-sm">
              {action.label}
            </div>
            <div className="text-xs text-text-muted mt-1">
              {action.description}
            </div>
          </Link>
        );
      })}
    </div>
  );
}