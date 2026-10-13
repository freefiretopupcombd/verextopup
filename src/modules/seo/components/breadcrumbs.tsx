import Link from "next/link";
import { ChevronRight } from "lucide-react";

// ==================================================
// Breadcrumbs — UI + JSON-LD (BreadcrumbList schema)
// ==================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://verextopup.com";

type BreadcrumbItem = {
  name: string;
  url: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  // ---- JSON-LD BreadcrumbList ----
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  const jsonLd = JSON.stringify(breadcrumbSchema);

  return (
    <>
      {/* JSON-LD for search engines */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* Visual breadcrumbs for users */}
      <nav
        aria-label="Breadcrumb"
        className={`max-w-7xl mx-auto px-4 sm:px-6 py-4 ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1 text-sm text-text-muted">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li
                key={`${item.url}-${index}`}
                className="flex items-center gap-1"
              >
                {isLast ? (
                  <span
                    className="text-text-primary font-medium truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.url}
                      className="hover:text-primary transition"
                    >
                      {item.name}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}