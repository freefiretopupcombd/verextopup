"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

// ==================================================
// SLIDER ARROWS — Compact
// ==================================================
export function SliderArrows({
  onPrev,
  onNext,
  currentIndex,
  totalSlides,
}: {
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  totalSlides: number;
}) {
  if (totalSlides <= 1) return null;

  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        className="group absolute left-2 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        type="button"
        onClick={onNext}
        className="group absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </>
  );
}

// ==================================================
// SLIDER DOTS — Compact pill
// ==================================================
export function SliderDots({
  currentIndex,
  totalSlides,
  onDotClick,
  accentColor = "#FFFFFF",
}: {
  currentIndex: number;
  totalSlides: number;
  onDotClick: (index: number) => void;
  accentColor?: string;
}) {
  if (totalSlides <= 1) return null;

  return (
    <div
      className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 backdrop-blur-md bg-black/40 border border-white/10 rounded-full px-2.5 py-1.5 shadow-lg"
      role="tablist"
      aria-label="Slide navigation"
    >
      {Array.from({ length: totalSlides }).map((_, idx) => {
        const isActive = idx === currentIndex;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onDotClick(idx)}
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              isActive
                ? "w-6 h-1.5 bg-white shadow-md"
                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/90 hover:w-3"
            }`}
          />
        );
      })}
    </div>
  );
}