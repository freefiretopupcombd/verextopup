"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";

import type { HeroSlidePublic } from "../queries";

// ==================================================
// Dynamic Icon Loader
// ==================================================
function getIcon(name: string | null | undefined) {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  return Icon || null;
}

// ==================================================
// SLIDE ITEM
// ==================================================
export function SlideItem({
  slide,
  isActive,
  priority = false,
}: {
  slide: HeroSlidePublic;
  isActive: boolean;
  priority?: boolean;
}) {
  const BadgeIcon = getIcon(slide.badgeIcon);
  const Btn1Icon = getIcon(slide.button1Icon) || ArrowRight;
  const Btn2Icon = getIcon(slide.button2Icon);

  const btn1Target = slide.openInNewTab ? "_blank" : undefined;
  const btn1Rel = slide.openInNewTab ? "noopener noreferrer" : undefined;
  const btn2Target = slide.openInNewTab ? "_blank" : undefined;
  const btn2Rel = slide.openInNewTab ? "noopener noreferrer" : undefined;

  return (
    <article
      className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
      aria-hidden={!isActive}
      aria-roledescription="slide"
    >
            {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${slide.imageMobile || slide.image})`,
        }}
        role="img"
        aria-label={slide.title}
      />

      {/* Base overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: slide.overlayColor,
          opacity: slide.overlayOpacity / 100,
        }}
        aria-hidden="true"
      />

      {/* Left-to-right gradient for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, ${slide.overlayColor}f2 0%, ${slide.overlayColor}a6 40%, ${slide.overlayColor}26 70%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Bottom gradient for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 40%, ${slide.overlayColor}80 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${slide.accentColor}35 0%, transparent 45%)`,
        }}
        aria-hidden="true"
      />

      {/* Content — centered in container */}
      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 flex items-center">
        <div
          className={`max-w-lg lg:max-w-xl transition-all duration-700 delay-150 ${
            isActive
              ? "translate-x-0 opacity-100"
              : "-translate-x-6 opacity-0"
          }`}
          style={{ color: slide.textColor }}
        >
          {/* Badge */}
          {slide.badgeText && (
            <div
              className="inline-flex items-center gap-2 backdrop-blur-md border rounded-full px-3 py-1.5 mb-4 text-[11px] sm:text-xs font-semibold shadow-lg"
              style={{
                backgroundColor: `${slide.accentColor}30`,
                borderColor: `${slide.accentColor}70`,
                color: slide.textColor,
                boxShadow: `0 4px 16px -4px ${slide.accentColor}50`,
              }}
            >
              {BadgeIcon && (
                <BadgeIcon
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                  style={{ color: slide.accentColor }}
                />
              )}
              <span>{slide.badgeText}</span>
            </div>
          )}

          {/* Title */}
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight"
            style={{
              color: slide.textColor,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            {slide.title}
          </h2>

          {/* Subtitle */}
          {slide.subtitle && (
            <p
              className="text-sm sm:text-base lg:text-lg mt-3 sm:mt-4 leading-relaxed opacity-95 max-w-md"
              style={{
                color: slide.textColor,
                textShadow: "0 1px 10px rgba(0,0,0,0.4)",
              }}
            >
              {slide.subtitle}
            </p>
          )}

          {/* Description */}
          {slide.description && (
            <p
              className="text-xs sm:text-sm mt-2 opacity-80 max-w-md"
              style={{ color: slide.textColor }}
            >
              {slide.description}
            </p>
          )}

          {/* CTA Buttons */}
          {(slide.button1Text || slide.button2Text) && (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-5 sm:mt-6">
              {slide.button1Text && slide.button1Url && (
                <Link
                  href={slide.button1Url}
                  target={btn1Target}
                  rel={btn1Rel}
                  className={`group inline-flex items-center gap-2 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-sm shadow-xl ${
                    slide.button1Style === "primary"
                      ? "text-white hover:scale-105 active:scale-95"
                      : slide.button1Style === "outline"
                        ? "border-2 bg-transparent backdrop-blur-sm hover:bg-white/10"
                        : "bg-white/10 backdrop-blur-md hover:bg-white/20"
                  }`}
                  style={
                    slide.button1Style === "primary"
                      ? {
                          backgroundColor: slide.accentColor,
                          boxShadow: `0 12px 30px -10px ${slide.accentColor}90`,
                        }
                      : slide.button1Style === "outline"
                        ? {
                            borderColor: slide.textColor,
                            color: slide.textColor,
                          }
                        : {
                            color: slide.textColor,
                          }
                  }
                >
                  <Btn1Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  {slide.button1Text}
                </Link>
              )}

              {slide.button2Text && slide.button2Url && (
                <Link
                  href={slide.button2Url}
                  target={btn2Target}
                  rel={btn2Rel}
                  className="group inline-flex items-center gap-2 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-sm hover:scale-105 active:scale-95"
                  style={{
                    borderColor: `${slide.textColor}70`,
                    color: slide.textColor,
                  }}
                >
                  {Btn2Icon && <Btn2Icon className="w-4 h-4" />}
                  {slide.button2Text}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}