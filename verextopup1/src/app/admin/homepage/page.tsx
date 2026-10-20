import type { Metadata } from "next";
import Link from "next/link";
import { Plus, LayoutGrid } from "lucide-react";

import { requireAdmin } from "@/lib/auth/session";
import { getAllHomepageSections } from "@/modules/homepage/queries";
import { SectionList } from "@/modules/homepage/components/admin/section-list";

export const metadata: Metadata = {
  title: "Homepage Sections — Admin",
  robots: { index: false, follow: false },
};

export default async function HomepageSectionsPage() {
  await requireAdmin();

  const sections = await getAllHomepageSections();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary" />
            Homepage Sections
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Homepage এ যে section গুলো দেখানো হবে সেগুলো manage করুন
          </p>
        </div>
        <Link
          href="/admin/homepage/new"
          className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-4 py-2.5 rounded-lg transition hover:shadow-lg hover:shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          নতুন Section
        </Link>
      </div>

      {/* Sections list */}
      <SectionList sections={sections} />
    </div>
  );
}