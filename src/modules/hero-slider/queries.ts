import "server-only";

import { prisma } from "@/lib/prisma";

// ==================================================
// PUBLIC QUERIES — for frontend
// ==================================================

// ==================================================
// GET ACTIVE SLIDES (for homepage)
// ==================================================
// - Only active slides
// - Only within scheduling window (if set)
// - Sorted by sortOrder
// ==================================================
export async function getActiveHeroSlides() {
  const now = new Date();

  const slides = await prisma.heroSlide.findMany({
    where: {
      isActive: true,
      AND: [
        {
          OR: [
            { startAt: null },
            { startAt: { lte: now } },
          ],
        },
        {
          OR: [
            { endAt: null },
            { endAt: { gte: now } },
          ],
        },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return slides;
}

// ==================================================
// ADMIN QUERIES
// ==================================================

// ==================================================
// GET ALL SLIDES (admin panel)
// ==================================================
export async function getAllHeroSlides() {
  return prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

// ==================================================
// GET SLIDE BY ID
// ==================================================
export async function getHeroSlideById(id: string) {
  return prisma.heroSlide.findUnique({
    where: { id },
  });
}

// ==================================================
// STATS — for admin dashboard
// ==================================================
export async function getHeroSliderStats() {
  const now = new Date();

  const [total, active, scheduled, expired] = await Promise.all([
    prisma.heroSlide.count(),
    prisma.heroSlide.count({
      where: {
        isActive: true,
        OR: [
          { startAt: null },
          { startAt: { lte: now } },
        ],
      },
    }),
    prisma.heroSlide.count({
      where: {
        isActive: true,
        startAt: { gt: now },
      },
    }),
    prisma.heroSlide.count({
      where: {
        isActive: true,
        endAt: { lt: now },
      },
    }),
  ]);

  return {
    total,
    active,
    scheduled,
    expired,
  };
}

// ==================================================
// TYPE EXPORT
// ==================================================
export type HeroSlidePublic = Awaited<
  ReturnType<typeof getActiveHeroSlides>
>[number];