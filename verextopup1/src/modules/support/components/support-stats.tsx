import { Clock, MessageSquare, CheckCircle2, Users } from "lucide-react";

export function SupportStats({
  totalTickets,
  openTickets,
  avgResponseHours,
}: {
  totalTickets: number;
  openTickets: number;
  avgResponseHours: number;
}) {
  const stats = [
    {
      icon: MessageSquare,
      label: "Total Tickets",
      value: totalTickets.toLocaleString(),
      color: "primary",
    },
    {
      icon: Clock,
      label: "Avg Response Time",
      value: `${avgResponseHours}h`,
      color: "success",
    },
    {
      icon: CheckCircle2,
      label: "Resolved",
      value: "98%",
      color: "accent",
    },
    {
      icon: Users,
      label: "Active Support",
      value: "24/7",
      color: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        const colors = {
          primary: "bg-primary/10 text-primary",
          success: "bg-success/10 text-success",
          accent: "bg-accent/10 text-accent",
          warning: "bg-warning/10 text-warning",
        };

        return (
          <div
            key={s.label}
            className="bg-bg-card border border-border rounded-xl p-4 text-center"
          >
            <div
              className={`w-9 h-9 rounded-lg ${colors[s.color as keyof typeof colors]} flex items-center justify-center mx-auto mb-2`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-text-primary">
              {s.value}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mt-0.5">
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}