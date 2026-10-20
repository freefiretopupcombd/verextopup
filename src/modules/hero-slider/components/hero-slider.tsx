"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import type { HeroSlidePublic } from "../queries";
import { SlideItem } from "./slide-item";
import { SliderArrows, SliderDots } from "./slider-controls";

const AUTO_PLAY_INTERVAL = 6000;

export function HeroSlider({ slides }: { slides: HeroSlidePublic[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides.length;

  const goToSlide = useCallback(
    (index: number) => {
      if (totalSlides === 0) return;
      const nextIndex = ((index % totalSlides) + totalSlides) % totalSlides;
      setCurrentIndex(nextIndex);
    },
    [totalSlides]
  );

  const goNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (totalSlides <= 1) return;
    if (isPaused) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    autoplayTimerRef.current = setInterval(() => {
      goNext();
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [totalSlides, isPaused, goNext]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  const MIN_SWIPE_DISTANCE = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.target.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
  };

  if (totalSlides === 0) {
    return null;
  }

  return (
    <section
      className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4"
      aria-label="Featured promotions"
    >
      <div
        ref={containerRef}
        // ✅ মোবাইলে হাইট কমিয়ে 180px করা হলো, ডেস্কটপে আগের মতোই আছে
        className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-[180px] sm:h-[280px] md:h-[340px] lg:h-[400px] xl:h-[450px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
      >
        <div className="absolute inset-0">
          {slides.map((slide, idx) => (
            <SlideItem
              key={slide.id}
              slide={slide}
              isActive={idx === currentIndex}
              priority={idx === 0}
            />
          ))}
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Slide {currentIndex + 1} of {totalSlides}
        </div>

        {totalSlides > 1 && (
          <SliderArrows
            onPrev={goPrev}
            onNext={goNext}
            currentIndex={currentIndex}
            totalSlides={totalSlides}
          />
        )}

        {totalSlides > 1 && (
          <SliderDots
            currentIndex={currentIndex}
            totalSlides={totalSlides}
            onDotClick={goToSlide}
          />
        )}
      </div>
    </section>
  );
}