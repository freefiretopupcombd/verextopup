import {
  Wallet,
  ShoppingBag,
  Star,
  Headphones,
  Clock,
  Snowflake,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

type UserDetail = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  twoFactorEnabled: boolean;
  wallet: {
    balance: number;
    totalCredited: number;
    totalDebited: number;
    creditCount: number;
    debitCount: number;
    status: string;
  } | null;
  stats: {
    orderCount: number;
    orderTotal: number;
    reviewCount: number;
    ticketCount: number;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
};

export function OverviewTab({ user }: { user: UserDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Profile Details */}
      <Card title="Profile Information">
        <div className="space-y-3">
          <InfoRow label="Full Name" value={user.name || "—"} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone || "—"} />
          <InfoRow
            label="Role"
            value={
              <span className="font-mono text-xs">{user.role}</span>
            }
          />
          <InfoRow
            label="Status"
            value={
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  user.status === "ACTIVE"
                    ? "bg-success/15 text-success"
                    : user.status === "BANNED"
                      ? "bg-danger/15 text-danger"
                      : "bg-text-muted/15 text-text-muted"
                }`}
              >
                {user.status}
              </span>
            }
          />
          <InfoRow
            label="2FA"
            value={
              user.twoFactorEnabled ? (
                <span className="text-success">Enabled ✓</span>
              ) : (
                <span className="text-text-muted">Disabled</span>
              )
            }
          />
          <InfoRow
            label="Joined"
            value={new Date(user.createdAt).toLocaleString()}
          />
          {user.lastLoginAt && (
            <InfoRow
              label="Last Login"
              value={
                <span className="flex items-center gap-1 text-text-muted">
                  <Clock className="w-3 h-3" />
                  {new Date(user.lastLoginAt).toLocaleString()}
                </span>
              }
            />
          )}
        </div>
      </Card>

      {/* Wallet Summary */}
      <Card
        title="Wallet Summary"
        action={
          <Link
            href={`?tab=wallet`}
            className="text-xs text-primary hover:underline"
          >
            View All →
          </Link>
        }
      >
        {user.wallet ? (
          <div className="space-y-3">
            <div
              className={`rounded-lg p-3 ${
                user.wallet.status === "FROZEN"
                  ? "bg-warning/10 border border-warning/20"
                  : "bg-primary/5"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium flex items-center gap-1.5">
                {user.wallet.status === "FROZEN" && (
                  <Snowflake className="w-3 h-3 text-warning" />
                )}
                Current Balance
              </div>
              <div className="text-2xl font-bold text-text-primary mt-1">
                ৳{user.wallet.balance.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-success/5 rounded-lg p-3">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-success font-medium">
                  <TrendingUp className="w-3 h-3" />
                  Credited
                </div>
                <div className="text-sm font-bold text-text-primary mt-1">
                  ৳{user.wallet.totalCredited.toFixed(2)}
                </div>
                <div className="text-[10px] text-text-muted">
                  {user.wallet.creditCount} txns
                </div>
              </div>
              <div className="bg-danger/5 rounded-lg p-3">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-danger font-medium">
                  <TrendingDown className="w-3 h-3" />
                  Debited
                </div>
                <div className="text-sm font-bold text-text-primary mt-1">
                  ৳{user.wallet.totalDebited.toFixed(2)}
                </div>
                <div className="text-[10px] text-text-muted">
                  {user.wallet.debitCount} txns
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">No wallet found</p>
        )}
      </Card>

      {/* Recent Orders */}
      <Card
        title="Recent Orders"
        action={
          <Link
            href={`?tab=orders`}
            className="text-xs text-primary hover:underline"
          >
            View All →
          </Link>
        }
        className="lg:col-span-2"
      >
        {user.recentOrders.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            No orders yet
          </p>
        ) : (
          <div className="divide-y divide-border -mx-4">
            {user.recentOrders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/orders?search=${o.orderNumber}`}
                    className="text-sm font-mono font-medium text-primary hover:underline"
                  >
                    #{o.orderNumber}
                  </Link>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-text-primary">
                    ৳{o.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-text-muted uppercase">
                    {o.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Card({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-bg-card border border-border rounded-xl overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-bold text-text-primary text-sm">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-text-muted shrink-0">{label}:</span>
      <span className="text-text-primary text-right break-all">
        {value}
      </span>
    </div>
  );
}