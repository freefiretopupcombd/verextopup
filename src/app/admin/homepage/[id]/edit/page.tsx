import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import {
  getHomepageSectionById,
  getSectionManualProducts,
} from "@/modules/homepage/queries";
import { SectionForm } from "@/modules/homepage/components/admin/section-form";
import { searchProductsForPickerAction } from "@/modules/homepage/actions";

export const metadata: Metadata = {
  title: "Edit Section — Admin",
  robots: { index: false, follow: false },
};

export default async function EditHomepageSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const [section, categories, manualProducts] = await Promise.all([
    getHomepageSectionById(id),
    prisma.category.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getSectionManualProducts(id),
  ]);

  if (!section) notFound();

  // Debug log
  console.log("[EDIT PAGE] Section data:", {
    id: section.id,
    title: section.title,
    mobileColumns: section.mobileColumns,
    desktopColumns: section.desktopColumns,
    layoutType: section.layoutType,
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
          Section Edit করুন
        </h1>
        <p className="text-text-muted text-sm mt-1">{section.title}</p>
      </div>

      <SectionForm
        mode="edit"
        sectionId={section.id}
        initialData={{
          id: section.id,
          title: section.title,
          subtitle: section.subtitle,
          layoutType: section.layoutType,
          sourceType: section.sourceType,
          sourceData: section.sourceData as any,
          itemLimit: section.itemLimit,
          mobileColumns: section.mobileColumns,
          desktopColumns: section.desktopColumns,
          isActive: section.isActive,
          sortOrder: section.sortOrder,
          viewAllUrl: section.viewAllUrl,
          viewAllText: section.viewAllText,
          selectedProducts: manualProducts,
        }}
        categories={categories}
        searchProductsAction={searchProductsForPickerAction}
      />
    </div>
  );
}