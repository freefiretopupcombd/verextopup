import Link from "next/link";
import { PackageOpen, Home, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function ShopNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
          <PackageOpen className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          এই পেজটি পাওয়া যায়নি
        </h1>
        <p className="text-text-muted text-sm mb-6">
          যে প্রোডাক্ট বা পেজ খুঁজছিলেন সেটা সরিয়ে ফেলা হয়েছে অথবা
          লিংকটা ভুল।
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition"
          >
            <Home className="w-4 h-4" />
            সব প্রোডাক্ট দেখুন
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}