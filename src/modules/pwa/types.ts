// ==================================================
// PWA CONFIG TYPES
// ==================================================

export type PWADisplayMode =
  | "standalone"
  | "fullscreen"
  | "minimal-ui"
  | "browser";

export type PWAOrientation =
  | "portrait"
  | "landscape"
  | "any"
  | "portrait-primary"
  | "landscape-primary";

export type PWABannerPosition = "bottom" | "top";

export type PWAIconData = {
  /** External URL অথবা base64 data URI */
  src: string;
  /** "url" | "base64" */
  type: "url" | "base64";
};

export type PWAConfig = {
  // ---- Master toggles ----
  enabled: boolean;
  bannerEnabled: boolean;

  // ---- App info ----
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: PWADisplayMode;
  orientation: PWAOrientation;
  lang: string;

  // ---- Banner ----
  banner: {
    titleEn: string;
    titleBn: string;
    subtitleEn: string;
    subtitleBn: string;
    buttonTextEn: string;
    buttonTextBn: string;
    buttonColor: string;
    delaySeconds: number;
    showAfterVisits: number;
    dismissDays: number;
    position: PWABannerPosition;
  };

  // ---- Icons ----
  icons: {
    icon192: PWAIconData;
    icon512: PWAIconData;
    maskable192: PWAIconData;
    maskable512: PWAIconData;
    apple: PWAIconData;
  };

  // ---- Conditions ----
  conditions: {
    onlyMobile: boolean;
    onlyLoggedIn: boolean;
    onlyNewUsers: boolean;
    pages: "all" | "home" | "products" | "custom";
    customPaths: string;
  };
};

export const DEFAULT_PWA_CONFIG: PWAConfig = {
  enabled: true,
  bannerEnabled: true,

  name: "VerexTopUp — Instant Game Top-Up",
  shortName: "VerexTopUp",
  description:
    "Bangladesh's #1 instant game top-up platform. Free Fire, PUBG, Mobile Legends — instant delivery, 100% safe.",
  themeColor: "#7C3AED",
  backgroundColor: "#0a0a14",
  display: "standalone",
  orientation: "portrait",
  lang: "bn-BD",

  banner: {
    titleEn: "Install App",
    titleBn: "অ্যাপ ইনস্টল করুন",
    subtitleEn: "Get quick access, works offline too",
    subtitleBn: "দ্রুত access, offline-ও কাজ করে",
    buttonTextEn: "Install",
    buttonTextBn: "ইনস্টল",
    buttonColor: "#ff8c42",
    delaySeconds: 5,
    showAfterVisits: 2,
    dismissDays: 7,
    position: "bottom",
  },

  icons: {
    icon192: { src: "", type: "url" },
    icon512: { src: "", type: "url" },
    maskable192: { src: "", type: "url" },
    maskable512: { src: "", type: "url" },
    apple: { src: "", type: "url" },
  },

  conditions: {
    onlyMobile: false,
    onlyLoggedIn: false,
    onlyNewUsers: false,
    pages: "all",
    customPaths: "",
  },
};

export const PWA_CONFIG_KEY = "pwa_config";