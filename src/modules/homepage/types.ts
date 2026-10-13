// ==================================================
// HOMEPAGE SECTION TYPES
// ==================================================

export const LAYOUT_TYPES = ["GRID", "CAROUSEL", "LIST"] as const;
export type LayoutType = (typeof LAYOUT_TYPES)[number];

export const SOURCE_TYPES = [
  "CATEGORY",
  "FEATURED",
  "ON_SALE",
  "POPULAR",
  "NEW_ARRIVALS",
  "SUBSCRIPTIONS",
  "MANUAL",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const LAYOUT_LABELS: Record<LayoutType, string> = {
  GRID: "Grid",
  CAROUSEL: "Carousel",
  LIST: "List",
};

export const LAYOUT_DESCRIPTIONS: Record<LayoutType, string> = {
  GRID: "Products in rows/columns (like Amazon)",
  CAROUSEL: "Horizontal scrolling (like Netflix)",
  LIST: "Full-width stacked cards",
};

export const SOURCE_LABELS: Record<SourceType, string> = {
  CATEGORY: "Products from a Category",
  FEATURED: "Featured Products",
  ON_SALE: "Products on Sale",
  POPULAR: "Best Selling Products",
  NEW_ARRIVALS: "New Arrivals",
  SUBSCRIPTIONS: "Subscription Products",
  MANUAL: "Manually Select Products",
};

export const SOURCE_DESCRIPTIONS: Record<SourceType, string> = {
  CATEGORY: "Pick a category — its products will show",
  FEATURED: "Auto: Admin-marked featured products",
  ON_SALE: "Auto: Products with sale price",
  POPULAR: "Auto: Highest selling products",
  NEW_ARRIVALS: "Auto: Latest products",
  SUBSCRIPTIONS: "Auto: All subscription products",
  MANUAL: "Pick specific products yourself",
};

export type HomepageSection = {
  id: string;
  title: string;
  subtitle: string | null;
  layoutType: LayoutType;
  sourceType: SourceType;
  sourceData: {
    categoryId?: string;
    categorySlug?: string;
  } | null;
  itemLimit: number;
  mobileColumns: number;
  desktopColumns: number;
  isActive: boolean;
  sortOrder: number;
  viewAllUrl: string | null;
  viewAllText: string;
  createdAt: Date;
  updatedAt: Date;
};

export type HomepageSectionProduct = {
  id: string;
  sectionId: string;
  productId: string;
  sortOrder: number;
};

export type SectionProduct = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  icon: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  soldCount: number;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  categoryName?: string | null;
  categorySlug?: string | null;
};

export type RenderedSection = {
  id: string;
  title: string;
  subtitle: string | null;
  layoutType: LayoutType;
  sourceType: SourceType;
  sourceData: {
    categoryId?: string;
    categorySlug?: string;
  } | null;
  itemLimit: number;
  mobileColumns: number;
  desktopColumns: number;
  viewAllUrl: string | null;
  viewAllText: string;
  products: SectionProduct[];
};