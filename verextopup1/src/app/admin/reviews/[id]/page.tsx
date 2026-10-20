import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getReviewByIdAdmin } from "@/modules/reviews/queries";
import { AdminReviewView } from "@/modules/reviews/admin/components/admin-review-view";

export const metadata: Metadata = {
  title: "Review Details — Admin",
};

export default async function AdminReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const review = await getReviewByIdAdmin(id);

  if (!review) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Reviews-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          Review Details
        </h1>
      </div>

      <AdminReviewView review={review} />
    </div>
  );
}