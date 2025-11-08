import { DefaultTheme } from "react-native-paper";

export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6366F1",
    secondary: "#EC4899",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    error: "#EF4444",
    text: "#1F2937",
  },
  roundness: 12,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export type AppTheme = typeof appTheme;
