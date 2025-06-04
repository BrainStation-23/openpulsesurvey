
import { ThemeConfig, DEFAULT_THEME } from "./config/exportConfig";

// Create theme from config
export const createTheme = (themeConfig: ThemeConfig = DEFAULT_THEME) => ({
  primary: themeConfig.primary,
  secondary: themeConfig.secondary,
  tertiary: themeConfig.tertiary,
  dark: themeConfig.dark,
  light: themeConfig.light,
  danger: themeConfig.danger,
  text: themeConfig.text,
  chart: themeConfig.chart
});

// Default theme for backward compatibility
export const THEME = createTheme();

// Slide masters that can be customized
export const createSlideMasters = (theme: ReturnType<typeof createTheme>) => ({
  TITLE: {
    background: { color: "FFFFFF" },
    margin: [0.5, 0.5, 0.5, 0.5],
  },
  CONTENT: {
    background: { color: "FFFFFF" },
    margin: [0.5, 0.5, 0.5, 0.5],
  },
  CHART: {
    background: { color: "FFFFFF" },
    margin: [0.5, 1, 0.5, 0.5],
  }
});

// Default slide masters for backward compatibility
export const slideMasters = createSlideMasters(THEME);
