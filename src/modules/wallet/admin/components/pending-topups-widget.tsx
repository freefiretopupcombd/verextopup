import Link from "next/link";
import { Clock, ExternalLink, CheckCircle2 } from "lucide-react";

type TopUp = {
  id: string;
  referenceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  senderNumber: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

export function PendingTopUpsWidget({ topUps }: { topUps: TopUp[] }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-warning" />
          <h3 className="font-bold text-text-primary text-sm">
            Pending Top-Ups
          </h3>
          {topUps.length > 0 && (
            <span className="text-[10px] bg-warning/15 text-warning px-2 py-0.5 rounded-full font-bold">
              {topUps.length}
            </span>
          )}
        </div>
        <Link
          href="/admin/wallets/topups"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View All <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {topUps.length === 0 ? (
        <div className="p-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-text-muted text-sm">
            সব top-up clear — কোনো pending নেই 🎉
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {topUps.map((t) => (
            <Link
              key={t.id}
              href={`/admin/wallets/topups?highlight=${t.id}`}
              className="flex items-center gap-3 p-3 hover:bg-bg-secondary/50 transition"
            >
              <div className="w-9 h-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                  {t.user.name || t.user.email}
                </div>
                <div className="text-[11px] text-text-muted font-mono truncate">
                  {t.referenceNumber}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-text-primary">
                  ৳{t.amount.toFixed(2)}
                </div>
                <div className="text-[10px] text-text-muted">
                  {new Date(t.createdAt).toLocaleString("en-BD", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}