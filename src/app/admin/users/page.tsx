import type { Metadata } from "next";
import { Users as UsersIcon } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { listUsers } from "@/modules/users/admin/queries";
import { UsersTable } from "@/modules/users/admin/components/users-table";
import { UsersFilters } from "@/modules/users/admin/components/users-filters";
import { Pagination } from "@/modules/products/components/pagination";

export const metadata: Metadata = {
  title: "Users — Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));

  const [session, data] = await Promise.all([
    getSession(),
    listUsers({
      search: params.search,
      role: params.role,
      status: params.status,
      sort: params.sort,
      page,
      perPage: 20,
    }),
  ]);

  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <UsersIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {data.total} জন registered user
          </p>
        </div>
      </div>

      {/* Filters */}
      <UsersFilters />

      {/* Table */}
      <UsersTable users={data.users} isSuperAdmin={isSuperAdmin} />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <Pagination currentPage={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}