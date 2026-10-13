import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { SectionForm } from "@/modules/homepage/components/admin/section-form";
import { searchProductsForPickerAction } from "@/modules/homepage/actions";

export const metadata: Metadata = {
  title: "New Section — Admin",
  robots: { index: false, follow: false },
};

export default async function NewHomepageSectionPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/homepage"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Homepage Sections এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          নতুন Section তৈরি করুন
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Homepage এ একটি নতুন section যোগ করুন
        </p>
      </div>

      <SectionForm
        mode="create"
        categories={categories}
        searchProductsAction={searchProductsForPickerAction}
      />
    </div>
  );
}