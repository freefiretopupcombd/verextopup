import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { PaymentView } from "./payment-view";

export const metadata: Metadata = {
  title: "Checkout",
  robots: {
    index: false,
    follow: false, // সম্পূর্ণ private
  },
};
export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ variantId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { variantId } = await params;
  const sp = await searchParams;

  const quantity = Math.max(1, parseInt(sp.quantity || "1"));
  const paymentType = sp.paymentType === "wallet" ? "wallet" : "instant";
  const methodId = sp.methodId || null;

  // Fetch variant + product
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        include: {
          category: { select: { name: true, slug: true } },
          fields: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!variant) notFound();
  if (variant.status !== "ACTIVE" || variant.product.status !== "ACTIVE") {
    notFound();
  }

  // Wallet balance
  const userId = (session.user as any).id as string;
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  const walletBalance = wallet ? Number(wallet.balance) : 0;

  // Payment method
  let paymentMethod = null;
  if (paymentType === "instant" && methodId) {
    const pm = await prisma.paymentMethod.findUnique({
      where: { id: methodId },
    });
    if (pm && pm.status === "ACTIVE") {
      paymentMethod = {
        id: pm.id,
        name: pm.name,
        slug: pm.slug,
        type: pm.type,
        logo: pm.logo,
        instructions: pm.instructions,
        accountNumber: pm.accountNumber,
        merchantNumber: pm.merchantNumber,
        inputFields: Array.isArray(pm.inputFields)
          ? (pm.inputFields as any[])
          : [],
      };
    }
  }

  // Extract product field values from searchParams
  const productFieldValues: Record<string, string> = {};
  for (const field of variant.product.fields) {
    productFieldValues[field.name] = sp[field.name] || "";
  }

  const unitPrice = Number(variant.price);
  const salePrice = variant.salePrice ? Number(variant.salePrice) : null;
  const finalUnitPrice = salePrice ?? unitPrice;
  const totalAmount = finalUnitPrice * quantity;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-text-muted mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          href={`/products/${variant.product.slug}`}
          className="hover:text-primary transition"
        >
          {variant.product.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-text-secondary">Payment</span>
      </nav>

      <PaymentView
        variant={{
          id: variant.id,
          name: variant.name,
          price: unitPrice,
          salePrice,
          icon: (variant.customFields as any)?.icon || null,
        }}
        product={{
          id: variant.product.id,
          name: variant.product.name,
          slug: variant.product.slug,
          thumbnail: variant.product.thumbnail,
          icon: variant.product.icon,
          categoryName: variant.product.category?.name || null,
        }}
        quantity={quantity}
        totalAmount={totalAmount}
        paymentType={paymentType}
        paymentMethod={paymentMethod}
        walletBalance={walletBalance}
        productFieldValues={productFieldValues}
      />
    </div>
  );
}