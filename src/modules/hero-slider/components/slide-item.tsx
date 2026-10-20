"use client";

import Image from "next/image";
import type { HeroSlidePublic } from "../queries";

export function SlideItem({
  slide,
  isActive,
  priority = false,
}: {
  slide: HeroSlidePublic;
  isActive: boolean;
  priority?: boolean;
}) {
  const imageSrc = slide.image;
  const imageSrcMobile = slide.imageMobile || slide.image;

  return (
    <article
      className={`absolute inset-0 transition-opacity duration-700 ease-out ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
      aria-hidden={!isActive}
      aria-roledescription="slide"
    >
      {/* Mobile Image */}
      <div className="absolute inset-0 lg:hidden">
        <Image
          src={imageSrcMobile}
          alt="Slider Banner"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={priority}
          quality={85}
        />
      </div>

      {/* Desktop Image */}
      <div className="absolute inset-0 hidden lg:block">
        <Image
          src={imageSrc}
          alt="Slider Banner"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={priority}
          quality={85}
        />
      </div>
    </article>
  );
}