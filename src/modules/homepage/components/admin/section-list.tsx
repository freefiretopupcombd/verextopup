"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Rows3,
  Tag,
  Star,
  TrendingUp,
  Sparkles,
  Clock,
  Crown,
  MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteHomepageSectionAction,
  toggleHomepageSectionAction,
} from "../../actions";
import {
  LAYOUT_LABELS,
  SOURCE_LABELS,
} from "../../types";

type Section = {
  id: string;
  title: string;
  subtitle: string | null;
  layoutType: string;
  sourceType: string;
  itemLimit: number;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
};

const LAYOUT_ICONS: Record<string, any> = {
  GRID: LayoutGrid,
  CAROUSEL: Rows3,
  LIST: List,
};

const SOURCE_ICONS: Record<string, any> = {
  CATEGORY: Tag,
  FEATURED: Star,
  ON_SALE: Sparkles,
  POPULAR: TrendingUp,
  NEW_ARRIVALS: Clock,
  SUBSCRIPTIONS: Crown,
  MANUAL: MousePointerClick,
};

export function SectionList({ sections }: { sections: Section[] }) {
  if (sections.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-text-muted mb-4">এখনো কোনো section নেই</p>
        <Link
          href="/admin/homepage/new"
          className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-5 py-2.5 rounded-lg transition"
        >
          প্রথম Section তৈরি করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}

function SectionCard({ section }: { section: Section }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglePending, startToggle] = useTransition();
  const [isActive, setIsActive] = useState(section.isActive);

  const LayoutIcon = LAYOUT_ICONS[section.layoutType] || LayoutGrid;
  const SourceIcon = SOURCE_ICONS[section.sourceType] || Tag;

  const handleToggle = () => {
    const newState = !isActive;
    startToggle(async () => {
      const result = await toggleHomepageSectionAction(section.id, newState);
      if (result.success) {
        setIsActive(newState);
        toast.success(result.message || "Updated");
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`"${section.title}" delete করবেন?`)) return;

    startTransition(async () => {
      const result = await deleteHomepageSectionAction(section.id);
      if (result.success) {
        toast.success(result.message || "Deleted");
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/30 transition">
      <div className="flex items-start gap-4">
        {/* Sort badge */}
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
          #{section.sortOrder}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-text-primary truncate">
                {section.title}
              </h3>
              {section.subtitle && (
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {section.subtitle}
                </p>
              )}
            </div>

            {/* Status */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={togglePending}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition shrink-0 ${
                isActive
                  ? "bg-success/15 text-success hover:bg-success/25"
                  : "bg-bg-secondary text-text-muted hover:bg-bg-card"
              }`}
            >
              {togglePending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isActive ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              {isActive ? "Active" : "Inactive"}
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 bg-bg-secondary border border-border px-2 py-1 rounded-md text-text-secondary">
              <LayoutIcon className="w-3 h-3" />
              {LAYOUT_LABELS[section.layoutType as keyof typeof LAYOUT_LABELS] ||
                section.layoutType}
            </span>

            <span className="inline-flex items-center gap-1 bg-bg-secondary border border-border px-2 py-1 rounded-md text-text-secondary">
              <SourceIcon className="w-3 h-3" />
              {SOURCE_LABELS[section.sourceType as keyof typeof SOURCE_LABELS] ||
                section.sourceType}
            </span>

            <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-md font-semibold">
              Max {section.itemLimit} items
            </span>

            {section.sourceType === "MANUAL" && (
              <span className="inline-flex items-center gap-1 bg-warning/10 border border-warning/20 text-warning px-2 py-1 rounded-md">
                {section._count.products} picked
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/admin/homepage/${section.id}/edit`}
            className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-primary transition"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition disabled:opacity-50"
            title="Delete"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}