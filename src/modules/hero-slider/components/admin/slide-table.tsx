"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteHeroSlideAction,
  toggleHeroSlideActiveAction,
} from "../../actions";

type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  isActive: boolean;
  sortOrder: number;
  startAt: Date | null;
  endAt: Date | null;
  viewCount: number;
  clickCount: number;
  createdAt: Date;
};

export function SlideTable({ slides }: { slides: Slide[] }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-secondary/50">
              <th className="text-left p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">
                Slide
              </th>
              <th className="text-left p-4 font-semibold text-text-muted text-xs uppercase tracking-wider hidden md:table-cell">
                Schedule
              </th>
              <th className="text-left p-4 font-semibold text-text-muted text-xs uppercase tracking-wider hidden lg:table-cell">
                Views
              </th>
              <th className="text-left p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="text-right p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {slides.map((slide) => (
              <SlideRow key={slide.id} slide={slide} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SlideRow({ slide }: { slide: Slide }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglePending, startToggle] = useTransition();
  const [isActive, setIsActive] = useState(slide.isActive);

  const handleToggle = () => {
    const newState = !isActive;
    startToggle(async () => {
      const result = await toggleHeroSlideActiveAction(slide.id, newState);
      if (result.success) {
        setIsActive(newState);
        toast.success(result.message || "Updated");
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        `"${slide.title}" delete করবেন? এটা permanent — undo করা যাবে না।`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteHeroSlideAction(slide.id);
      if (result.success) {
        toast.success(result.message || "Deleted");
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const scheduleStatus = (() => {
    const now = new Date();
    if (slide.startAt && new Date(slide.startAt) > now) {
      return { label: "Scheduled", color: "text-warning" };
    }
    if (slide.endAt && new Date(slide.endAt) < now) {
      return { label: "Expired", color: "text-text-muted" };
    }
    return null;
  })();

  return (
    <tr className="border-b border-border last:border-0 hover:bg-bg-secondary/30 transition">
      {/* Slide thumbnail + title */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 rounded-md overflow-hidden bg-bg-secondary border border-border shrink-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-text-primary text-sm truncate max-w-[250px]">
              {slide.title}
            </div>
            {slide.subtitle && (
              <div className="text-xs text-text-muted truncate max-w-[250px] mt-0.5">
                {slide.subtitle}
              </div>
            )}
            <div className="text-[10px] text-text-muted mt-1 font-mono">
              Order: {slide.sortOrder}
            </div>
          </div>
        </div>
      </td>

      {/* Schedule */}
      <td className="p-4 hidden md:table-cell">
        {slide.startAt || slide.endAt ? (
          <div className="text-xs text-text-muted space-y-0.5">
            {slide.startAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(slide.startAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
            {slide.endAt && (
              <div className="flex items-center gap-1">
                <span className="opacity-50">→</span>
                {new Date(slide.endAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
            {scheduleStatus && (
              <div className={`font-semibold ${scheduleStatus.color}`}>
                {scheduleStatus.label}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-text-muted">Always on</span>
        )}
      </td>

      {/* Views */}
      <td className="p-4 hidden lg:table-cell">
        <div className="text-xs text-text-muted">
          <div>{slide.viewCount.toLocaleString()} views</div>
          <div>{slide.clickCount.toLocaleString()} clicks</div>
        </div>
      </td>

      {/* Status toggle */}
      <td className="p-4">
        <button
          type="button"
          onClick={handleToggle}
          disabled={togglePending}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
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
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center justify-end gap-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition"
            title="Preview on homepage"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Link
            href={`/admin/hero-slider/${slide.id}/edit`}
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
      </td>
    </tr>
  );
}