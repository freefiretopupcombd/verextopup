import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/session";
import { getHeroSlideById } from "@/modules/hero-slider/queries";
import { HeroSlideForm } from "@/modules/hero-slider/components/admin/slide-form";

export const metadata: Metadata = {
  title: "Edit Slide — Admin",
  robots: { index: false, follow: false },
};

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const slide = await getHeroSlideById(id);

  if (!slide) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/hero-slider"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Hero Slider-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          Slide Edit করুন
        </h1>
        <p className="text-text-muted text-sm mt-1">{slide.title}</p>
      </div>

      <HeroSlideForm
        mode="edit"
        slideId={slide.id}
        initialData={slide}
      />
    </div>
  );
}