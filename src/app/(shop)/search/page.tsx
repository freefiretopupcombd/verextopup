import type { Metadata } from "next";

import { listProductsPaged } from "@/modules/products/queries";
import { ProductGrid } from "@/modules/products/components/product-grid";
import { SortDropdown } from "@/modules/products/components/sort-dropdown";
import { Pagination } from "@/modules/products/components/pagination";
import { EmptyState } from "@/modules/products/components/empty-state";

export const metadata: Metadata = {
  title: "Search",
  robots: {
    index: false,
    follow: true, // Link equity ছড়াবে, কিন্তু index হবে না
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const { q, sort, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1"));
  const query = (q || "").trim();

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <EmptyState
          title="কী খুঁজছেন?"
          description="উপরে search box-এ game বা product-এর নাম লিখুন।"
          actionHref="/products"
          actionLabel="সব Product দেখুন"
        />
      </div>
    );
  }

  const { products, total, totalPages } = await listProductsPaged({
    search: query,
    sort: (sort as any) || "newest",
    page,
    perPage: 24,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">
          Search Results
        </h1>
        <p className="text-sm text-text-muted mt-1">
          <span className="text-primary">&quot;{query}&quot;</span>-এর জন্য{" "}
          {total} টা product পাওয়া গেছে
        </p>
      </div>

      {/* Toolbar */}
      {products.length > 0 && (
        <div className="flex items-center justify-between mb-5">
          <div className="text-xs sm:text-sm text-text-muted">
            Showing {products.length} of {total}
          </div>
          <SortDropdown />
        </div>
      )}

      {/* Products */}
      {products.length === 0 ? (
        <EmptyState
          title={`"${query}"-এর জন্য কিছু পাওয়া যায়নি`}
          description="অন্য keyword দিয়ে চেষ্টা করুন।"
          actionHref="/products"
          actionLabel="সব Product দেখুন"
        />
      ) : (
        <>
          <ProductGrid products={products} />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}