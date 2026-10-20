import type { Metadata } from "next";

import { listAllTransactions } from "@/modules/wallet/admin/queries";
import { TransactionsTable } from "@/modules/wallet/admin/components/transactions-table";
import { TransactionsFilters } from "@/modules/wallet/admin/components/transactions-filters";
import { Pagination } from "@/modules/products/components/pagination";

export const metadata: Metadata = {
  title: "Transactions — Admin",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));

  const data = await listAllTransactions({
    search: params.search,
    type: params.type,
    reason: params.reason,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page,
    perPage: 25,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Wallet Transactions
        </h1>
        <p className="text-text-muted text-sm mt-1">
          সব credit, debit, top-up, order payment — এক জায়গায়
        </p>
      </div>

      <TransactionsFilters />

      <div className="text-xs text-text-muted">
        {data.total} টা transaction found
      </div>

      <TransactionsTable transactions={data.transactions} />

      {data.totalPages > 1 && (
        <Pagination currentPage={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}