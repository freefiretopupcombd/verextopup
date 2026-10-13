import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-5">
        <PackageX className="w-10 h-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-content">
        Product পাওয়া যায়নি
      </h1>
      <p className="text-content-muted mt-2">
        এই product-টা নেই অথবা সরিয়ে ফেলা হয়েছে।
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          সব Products দেখুন
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-border hover:bg-muted text-content font-medium px-6 py-3 rounded-lg transition"
        >
          হোমপেজে যান
        </Link>
      </div>
    </div>
  );
}