import type { ReactNode } from "react";
import Link from "next/link";

import { requireAuth } from "@/lib/auth/session";
import { AccountSidebar } from "@/modules/users/admin/components/account-sidebar";
import { LogoutButton } from "@/modules/auth/components/logout-button";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAuth("/account");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-header text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            VerexTopUp
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar */}
          <aside>
            <AccountSidebar
              userName={session.user.name || "User"}
              userEmail={session.user.email || ""}
            />
          </aside>

          {/* Main content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}