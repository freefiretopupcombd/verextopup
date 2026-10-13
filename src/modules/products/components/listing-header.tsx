import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function ListingHeader({
  title,
  description,
  icon,
  image,
  productCount,
  breadcrumbs,
}: {
  title: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  productCount: number;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return (
    <div>
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="text-xs text-text-muted mb-4 flex items-center gap-1.5 flex-wrap">
          {breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-secondary">{item.label}</span>
              )}
              {i < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {icon ? (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-border flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            {icon}
          </div>
        ) : image ? (
          <img
            src={image}
            alt={title}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"
          />
        ) : null}

        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-text-muted mt-1.5 max-w-2xl">
              {description}
            </p>
          )}
          <p className="text-xs text-text-muted mt-2">
            {productCount} টা product
          </p>
        </div>
      </div>
    </div>
  );
}