import type { ReactNode } from "react";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/session";
import { AdminSidebar } from "@/modules/admin/components/admin-sidebar";
import { LogoutButton } from "@/modules/auth/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-header text-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold text-primary">
              VerexTopUp
            </Link>
            <span className="text-xs bg-accent px-2 py-1 rounded font-semibold">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-content-light hover:text-white transition"
            >
              View Site ↗
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <aside>
            <AdminSidebar
              userName={session.user.name || "Admin"}
              userEmail={session.user.email || ""}
            />
          </aside>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}