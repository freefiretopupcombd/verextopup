import Link from "next/link";
import { PackageSearch } from "lucide-react";

export function EmptyState({
  title = "কোনো product পাওয়া যায়নি",
  description = "শীঘ্রই আরো product আসছে।",
  actionHref,
  actionLabel,
}: {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-10 sm:p-14 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <PackageSearch className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-md mx-auto">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-block mt-5 bg-gradient-primary text-white font-medium px-5 py-2.5 rounded-lg transition text-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}