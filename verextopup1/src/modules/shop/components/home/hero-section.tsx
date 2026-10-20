import { getActiveHeroSlides } from "@/modules/hero-slider/queries";
import { HeroSlider } from "@/modules/hero-slider/components";

// ==================================================
// HERO SECTION
// ==================================================
// Server component — fetches active slides from DB.
// Renders HeroSlider client component.
// Falls back to default content if no slides configured.
// ==================================================

export async function HeroSection() {
  const slides = await getActiveHeroSlides();

  // No slides configured → show default hero
  if (slides.length === 0) {
    return <DefaultHero />;
  }

  // Render dynamic slider
  return <HeroSlider slides={slides} />;
}

// ==================================================
// DEFAULT HERO (fallback)
// ==================================================
// Shown when admin hasn't created any slides yet.
// Once they create slides, this is replaced automatically.
// ==================================================
function DefaultHero() {
  return (
    <section
      className="relative overflow-hidden h-[380px] sm:h-[460px] lg:h-[520px] border-b border-border bg-gradient-to-br from-primary/20 via-bg-secondary to-bg-primary"
      aria-label="Welcome"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[120px] opacity-20" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
            Welcome to{" "}
            <span className="text-gradient-primary">VerexTopUp</span>
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-4 max-w-lg">
            Your one-stop platform for game top-ups, digital subscriptions,
            and gift cards at the best prices.
          </p>
        </div>
      </div>
    </section>
  );
}