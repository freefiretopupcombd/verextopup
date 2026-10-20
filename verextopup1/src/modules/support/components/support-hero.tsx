import { Search, Sparkles } from "lucide-react";

export function SupportHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/10 border-b border-border">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 py-14 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">
            24/7 Support Available
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-text-primary leading-tight">
          আমরা আপনাকে <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">সাহায্য</span> করতে প্রস্তুত
        </h1>

        <p className="text-text-muted text-sm sm:text-base mt-4 max-w-xl mx-auto">
          সমস্যা হচ্ছে? প্রশ্ন আছে? আমাদের সাপোর্ট টিম কয়েক ঘন্টার মধ্যে
          উত্তর দেবে।
        </p>

        {/* Search */}
        {/* <form
          action="/support/search"
          method="GET"
          className="max-w-xl mx-auto mt-8 bg-bg-card border border-border rounded-2xl p-2 flex items-center gap-2 shadow-lg"
        >
          <Search className="w-4 h-4 text-text-muted ml-2 shrink-0" />
          <input
            type="text"
            name="q"
            placeholder="যেমন: Payment verify হচ্ছে না, Order cancel..."
            className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
          />
          <button
            type="submit"
            className="bg-gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shrink-0"
          >
            Search
          </button>
        </form> */}

        <div className="text-xs text-text-muted mt-3">
          জনপ্রিয়:{" "}
          <span className="text-primary">Payment issue</span>,{" "}
          <span className="text-primary">Wallet top-up</span>,{" "}
          <span className="text-primary">Order status</span>
        </div>
      </div>
    </section>
  );
}