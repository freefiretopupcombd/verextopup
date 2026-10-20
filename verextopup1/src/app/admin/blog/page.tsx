import type { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  Folder,
  ExternalLink,
} from "lucide-react";

import { listPostsAdmin, getBlogStats, listBlogCategories } from "@/modules/blog/queries";
import { BlogPostTable } from "@/modules/blog/admin/components/blog-post-table";
import { Pagination } from "@/modules/products/components/pagination";

export const metadata: Metadata = {
  title: "Blog — Admin",
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Drafts" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ARCHIVED", label: "Archived" },
];

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const status = params.status || "all";
  const page = Math.max(1, parseInt(params.page || "1"));

  const [data, stats] = await Promise.all([
    listPostsAdmin({ status, page, perPage: 20 }),
    getBlogStats(),
  ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Blog Posts</h1>
          <p className="text-text-muted text-sm mt-1">
            Blog content এবং SEO content manage করুন
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/blog/categories"
            className="inline-flex items-center gap-2 bg-bg-card border border-border hover:border-primary text-text-primary font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Folder className="w-4 h-4" />
            Categories
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={FileText}
          label="Total Posts"
          value={stats.total.toString()}
          color="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Published"
          value={stats.published.toString()}
          color="success"
        />
        <StatCard
          icon={Clock}
          label="Drafts"
          value={stats.drafts.toString()}
          color="warning"
        />
        <StatCard
          icon={Eye}
          label="Total Views"
          value={stats.totalViews.toLocaleString()}
          color="accent"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={
                tab.value === "all"
                  ? "/admin/blog"
                  : `/admin/blog?status=${tab.value}`
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                active
                  ? "bg-primary text-white"
                  : "bg-bg-card border border-border text-text-secondary hover:border-border-light"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="text-xs text-text-muted">
        {data.total} টা post
      </div>

      <BlogPostTable posts={data.posts} />

      {data.totalPages > 1 && (
        <Pagination currentPage={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: "primary" | "success" | "warning" | "accent";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div
        className={`w-9 h-9 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className="text-lg sm:text-xl font-bold text-text-primary mt-0.5">
        {value}
      </div>
    </div>
  );
}