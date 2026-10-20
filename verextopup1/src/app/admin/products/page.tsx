import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Package } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/modules/products/components/product-table";

export const metadata: Metadata = {
  title: "Products — Admin",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { variants: true } },
    },
  });

  // Serialize Decimal → Number (explicit field-by-field)
  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    thumbnail: p.thumbnail,
    icon: p.icon,
    price: Number(p.price),
    currency: p.currency,
    status: p.status,
    isFeatured: p.isFeatured,
    isPopular: p.isPopular,
    isNew: p.isNew,
    soldCount: p.soldCount,
    category: p.category,
    _count: p._count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="text-text-muted text-sm mt-1">
            মোট {products.length} টা product
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          নতুন Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            এখনো কোনো product নেই
          </h2>
          <p className="text-text-muted text-sm mb-6">
            প্রথম product তৈরি করুন
          </p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-5 py-2.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            প্রথম Product তৈরি করুন
          </Link>
        </div>
      ) : (
        <ProductTable products={serialized} />
      )}
    </div>
  );
}