import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Image as ImageIcon } from "lucide-react";

import { requireAdmin } from "@/lib/auth/session";
import {
  getAllHeroSlides,
  getHeroSliderStats,
} from "@/modules/hero-slider/queries";
import { SlideTable } from "@/modules/hero-slider/components/admin/slide-table";
import { StatsCards } from "@/modules/hero-slider/components/admin/stats-cards";

export const metadata: Metadata = {
  title: "Hero Slider — Admin",
  robots: { index: false, follow: false },
};

export default async function HeroSliderPage() {
  await requireAdmin();

  const [slides, stats] = await Promise.all([
    getAllHeroSlides(),
    getHeroSliderStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Hero Slider
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Homepage এ যে slides দেখানো হবে সেগুলো manage করুন
          </p>
        </div>
        <Link
          href="/admin/hero-slider/new"
          className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-4 py-2.5 rounded-lg transition hover:shadow-lg hover:shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          নতুন Slide
        </Link>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Empty state */}
      {slides.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            এখনো কোনো slide নেই
          </h2>
          <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
            প্রথম slide তৈরি করুন — homepage এ সেটা automatically দেখানো হবে।
            Admin যত খুশি slide বানাতে পারবে।
          </p>
          <Link
            href="/admin/hero-slider/new"
            className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-5 py-2.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            প্রথম Slide তৈরি করুন
          </Link>
        </div>
      ) : (
        <SlideTable slides={slides} />
      )}
    </div>
  );
}