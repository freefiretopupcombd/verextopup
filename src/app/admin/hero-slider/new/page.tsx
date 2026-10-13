import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/session";
import { HeroSlideForm } from "@/modules/hero-slider/components/admin/slide-form";

export const metadata: Metadata = {
  title: "New Slide — Admin",
  robots: { index: false, follow: false },
};

export default async function NewHeroSlidePage() {
  await requireAdmin();

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
          নতুন Slide তৈরি করুন
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Homepage slider এ যে slide দেখানো হবে
        </p>
      </div>

      <HeroSlideForm mode="create" />
    </div>
  );
}