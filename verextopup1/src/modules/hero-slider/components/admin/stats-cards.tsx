import { Image as ImageIcon, CheckCircle2, Clock, XCircle } from "lucide-react";

export function StatsCards({
  stats,
}: {
  stats: {
    total: number;
    active: number;
    scheduled: number;
    expired: number;
  };
}) {
  const cards = [
    {
      label: "Total Slides",
      value: stats.total,
      icon: ImageIcon,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Active",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Scheduled",
      value: stats.scheduled,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Expired",
      value: stats.expired,
      icon: XCircle,
      color: "text-text-muted",
      bg: "bg-bg-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs text-text-muted font-medium">
                {card.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}