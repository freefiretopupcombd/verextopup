"use client";

import { useState } from "react";
import { Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onChange(data.url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-text-muted">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`text-[10px] px-2 py-1 rounded ${mode === "upload" ? "bg-primary text-white" : "bg-bg-secondary text-text-muted"}`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`text-[10px] px-2 py-1 rounded ${mode === "url" ? "bg-primary text-white" : "bg-bg-secondary text-text-muted"}`}
          >
            URL
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative w-32 h-32 rounded-lg border border-border overflow-hidden bg-bg-secondary group">
          <Image src={value} alt="Uploaded" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          {mode === "upload" ? (
            <label className={`w-32 h-32 rounded-lg border-2 border-dashed border-border hover:border-primary transition flex flex-col items-center justify-center gap-2 bg-bg-secondary cursor-pointer ${uploading ? "opacity-50 cursor-wait" : ""}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-text-muted" />
                  <span className="text-[10px] text-text-muted text-center px-2">Click to upload</span>
                </>
              )}
            </label>
          ) : (
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}