export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  imageMobile: string | null;
  badgeText: string | null;
  badgeIcon: string | null;
  button1Text: string | null;
  button1Url: string | null;
  button1Icon: string | null;
  button1Style: string;
  button2Text: string | null;
  button2Url: string | null;
  button2Icon: string | null;
  overlayColor: string;
  overlayOpacity: number;
  textColor: string;
  accentColor: string;
  isActive: boolean;
  sortOrder: number;
  openInNewTab: boolean;
  startAt: Date | null;
  endAt: Date | null;
  viewCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type HeroSlideFormData = Omit<
  HeroSlide,
  "id" | "viewCount" | "clickCount" | "createdAt" | "updatedAt"
>;