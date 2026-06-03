import { Platform } from 'react-native';

// Lumi Mobile Theme Constants
// Matching the web frontend design system

export const Colors = {
  // Brand Primary - Sage Green
  brand: {
    primary: "#B6C4A2",
    primaryDark: "#c8d0a5",
    primaryLight: "#eaf0d0",
  },

  // Dark Theme
  dark: {
    background: "#1E1E1E",
    card: "#2A2A2A",
    elevated: "#333333",
    surface: "#3A3A3A",
    text: "#F2F2F2",
    textSecondary: "#A0A0A0",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
  },

  // Light Theme (for reference)
  light: {
    background: "#FFFFFF",
    card: "#F5F5F5",
    elevated: "#EEEEEE",
    surface: "#E0E0E0",
    text: "#1E1E1E",
    textSecondary: "#6B6B6B",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
  },

  // Text
  text: {
    primary: "#F2F2F2",
    secondary: "#A0A0A0",
    muted: "#6B6B6B",
    dark: "#1E1E1E",
  },

  // Glass Effects
  glass: {
    light: "rgba(255, 255, 255, 0.15)",
    lightBorder: "rgba(255, 255, 255, 0.20)",
    dark: "rgba(0, 0, 0, 0.20)",
    darkBorder: "rgba(0, 0, 0, 0.10)",
  },

  // Status
  status: {
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
    online: "#22C55E",
    offline: "#6B6B6B",
  },

  // Gradients (as arrays for LinearGradient)
  gradients: {
    brand: ["#B6C4A2", "#c8d0a5"],
    dark: ["#1E1E1E", "#2A2A2A"],
    glass: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"],
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
  // Compatibility padding/spacing properties for default components
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
  glass: 16,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

export const FontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

export const Fonts = {
  mono: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const MaxContentWidth = 1100;
export const BottomTabInset = 49;