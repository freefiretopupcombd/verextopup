import Link from "next/link";
import { ArrowRight, Check, Sparkles, Users } from "lucide-react";

// ==================================================
// PROMO BANNER — Compact & Professional
// ==================================================
export function PromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0620]">
        {/* Gradient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#7C3AED]/40 via-[#6366f1]/20 to-transparent rounded-full blur-[80px]" />
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative px-6 sm:px-10 lg:px-14 py-8 sm:py-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] rounded-full pl-1 pr-3 py-1 mb-4">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366f1]">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
            <span className="text-[11px] font-medium text-white/75">
              Trusted by 10,000+ gamers
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight max-w-xl mx-auto">
            Ready to top up your{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#818cf8] bg-clip-text text-transparent">
              gaming journey?
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-white/55 mt-3 max-w-lg mx-auto leading-relaxed">
            Join thousands of players getting instant top-ups, exclusive
            discounts, and 24/7 support.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-6">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 bg-white text-[#0a0620] font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 hover:shadow-xl hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm w-full sm:w-auto"
            >
              <Users className="w-4 h-4" />
              Create Free Account
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/games"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-white/[0.1] transition-all text-sm w-full sm:w-auto"
            >
              Browse Products
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2 h-2 text-emerald-400" strokeWidth={3} />
              </span>
              No credit card
            </span>
            <span className="hidden sm:block w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2 h-2 text-emerald-400" strokeWidth={3} />
              </span>
              Setup in 30s
            </span>
            <span className="hidden sm:block w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2 h-2 text-emerald-400" strokeWidth={3} />
              </span>
              Free forever
            </span>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2.5 mt-6">
            <div className="flex items-center -space-x-1.5">
              {[
                "from-violet-500 to-purple-600",
                "from-blue-500 to-cyan-500",
                "from-pink-500 to-rose-500",
                "from-amber-500 to-orange-500",
              ].map((gradient, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#0a0620] flex items-center justify-center text-[9px] font-bold text-white`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-white/[0.08] border-2 border-[#0a0620] flex items-center justify-center text-[8px] font-bold text-white/60">
                +9K
              </div>
            </div>
            <span className="text-[11px] text-white/50">
              joined this month
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}