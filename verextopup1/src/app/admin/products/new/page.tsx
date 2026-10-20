import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/modules/products/components/product-form";

export const metadata: Metadata = {
  title: "New Product — Admin",
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-content-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Products-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-content">নতুন Product</h1>
      </div>

      <ProductForm mode="create" categories={categories} />
    </div>
  );
}