import Link from "next/link";
import { Crown, ExternalLink } from "lucide-react";

export function TopSpendersList({
  spenders,
}: {
  spenders: {
    userId: string | null;
    name: string;
    email: string;
    image: string | null;
    totalSpent: number;
    orderCount: number;
  }[];
}) {
  if (spenders.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
        <Crown className="w-8 h-8 text-text-muted mx-auto mb-2" />
        <p className="text-text-muted text-sm">এই সময়ে কোনো spending নেই</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-bold text-text-primary text-sm">
          👑 Top Spenders
        </h3>
      </div>
      <div className="divide-y divide-border">
        {spenders.map((s, idx) => (
          <div
            key={s.userId}
            className="flex items-center gap-3 p-3 hover:bg-bg-secondary/40 transition"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                idx === 0
                  ? "bg-warning/20 text-warning"
                  : idx === 1
                    ? "bg-text-muted/20 text-text-secondary"
                    : idx === 2
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-primary/10 text-primary"
              }`}
            >
              {idx + 1}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {(s.name || s.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/admin/users/${s.userId}`}
                className="text-sm font-medium text-text-primary truncate hover:text-primary inline-flex items-center gap-1"
              >
                {s.name || "Unknown"}
                <ExternalLink className="w-3 h-3" />
              </Link>
              <div className="text-[10px] text-text-muted truncate">
                {s.email} · {s.orderCount} orders
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-success">
                ৳{s.totalSpent.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}