"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-text-primary hover:bg-bg-secondary hover:border-primary/50 transition text-sm font-medium"
    >
      <ArrowLeft className="w-4 h-4" />
      Go Back
    </button>
  );
}