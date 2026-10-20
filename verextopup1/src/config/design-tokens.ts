// src/config/design-tokens.ts
// এই ফাইল থেকে পুরো website-এর color control হবে
// Admin panel থেকেও পরে এটা override করা যাবে

export const designTokens = {
  colors: {
    primary: {
      DEFAULT: "#7C3AED",     // Modern premium purple
      light: "#A78BFA",
      dark: "#5B21B6",
      50: "#F5F3FF",
      100: "#EDE9FE",
      500: "#8B5CF6",
      600: "#7C3AED",
      700: "#6D28D9",
      900: "#4C1D95",
    },
    header: {
      DEFAULT: "#0B1226",     // Deep navy
      light: "#1E293B",
      dark: "#050914",
    },
    secondary: {
      DEFAULT: "#3B82F6",
      light: "#60A5FA",
      dark: "#1E40AF",
    },
    background: {
      DEFAULT: "#F8FAFC",     // Very light neutral
      card: "#FFFFFF",
      muted: "#F1F5F9",
    },
    text: {
      DEFAULT: "#0F172A",     // Dark navy/charcoal
      muted: "#64748B",
      light: "#94A3B8",
      inverse: "#FFFFFF",
    },
    border: {
      DEFAULT: "#E2E8F0",
      strong: "#CBD5E1",
    },
    state: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
    accent: {
      DEFAULT: "#EC4899",
    },
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
  },
  shadows: {
    card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
    cardHover: "0 10px 30px rgba(124,58,237,0.10)",
  },
} as const;

export type DesignTokens = typeof designTokens;