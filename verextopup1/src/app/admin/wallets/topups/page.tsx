import type { Metadata } from "next";

import { listPendingTopUps } from "@/modules/wallet/admin/queries";
import { TopUpsTable } from "@/modules/wallet/admin/components/topups-table";
import { TopUpsFilters } from "@/modules/wallet/admin/components/topups-filters";
import { Pagination } from "@/modules/products/components/pagination";

export const metadata: Metadata = {
  title: "Top-Ups — Admin",
};

export default async function TopUpsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const status = params.status || "pending";

  const data = await listPendingTopUps({
    status: status === "pending" ? undefined : status,
    page,
    perPage: 20,
  });

  // "pending" filter special case — শুধু pending দেখাতে চাইলে
  const filtered =
    status === "pending"
      ? data.topUps.filter(
          (t) => t.status === "PENDING" || t.status === "AWAITING_VERIFICATION"
        )
      : data.topUps;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Wallet Top-Ups
        </h1>
        <p className="text-text-muted text-sm mt-1">
          User-দের recharge request manage করুন
        </p>
      </div>

      <TopUpsFilters />

      <div className="text-xs text-text-muted">
        {status === "pending" ? filtered.length : data.total} টা entry
      </div>

      <TopUpsTable topUps={filtered} />

      {data.totalPages > 1 && (
        <Pagination currentPage={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}