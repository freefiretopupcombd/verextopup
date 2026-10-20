import {
  Shield,
  Clock,
  MapPin,
  Key,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

export function SecurityTab({
  user,
}: {
  user: {
    email: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt: string | null;
    lastLoginIp: string | null;
    createdAt: string;
    status: string;
  };
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Account Security">
        <div className="space-y-3">
          <SecurityRow
            icon={CheckCircle2}
            label="Email Verified"
            value={user.emailVerified ? "Yes" : "No"}
            status={user.emailVerified ? "success" : "warning"}
          />
          <SecurityRow
            icon={Key}
            label="Password Set"
            value="Yes"
            status="success"
          />
          <SecurityRow
            icon={Smartphone}
            label="2FA"
            value={user.twoFactorEnabled ? "Enabled" : "Disabled"}
            status={user.twoFactorEnabled ? "success" : "muted"}
          />
          <SecurityRow
            icon={Shield}
            label="Account Status"
            value={user.status}
            status={user.status === "ACTIVE" ? "success" : "danger"}
          />
        </div>
      </Card>

      <Card title="Login Activity">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Last Login
              </div>
              <div className="text-sm text-text-primary mt-0.5">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : "Never logged in"}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Last IP
              </div>
              <div className="text-sm text-text-primary font-mono mt-0.5">
                {user.lastLoginIp || "Unknown"}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Account Created
              </div>
              <div className="text-sm text-text-primary mt-0.5">
                {new Date(user.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-info/5 border border-info/20">
          <p className="text-xs text-text-primary">
            💡 সম্পূর্ণ session history (browser, device, IP) দেখতে চাইলে
            আলাদা feature দরকার। এটা Phase 7 এ যোগ করা যাবে।
          </p>
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-bold text-text-primary text-sm">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SecurityRow({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: any;
  label: string;
  value: string;
  status: "success" | "warning" | "danger" | "muted";
}) {
  const colors = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    muted: "bg-bg-secondary text-text-muted",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-lg ${colors[status]} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}