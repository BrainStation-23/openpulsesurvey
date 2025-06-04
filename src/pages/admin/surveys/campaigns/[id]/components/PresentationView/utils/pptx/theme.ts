
import { ThemeConfig, DEFAULT_THEME } from "./config/exportConfig";
import { createSlideBackground } from "./config/backgroundThemes";

// Create theme from config
export const createTheme = (themeConfig: ThemeConfig = DEFAULT_THEME) => ({
  primary: themeConfig.primary,
  secondary: themeConfig.secondary,
  tertiary: themeConfig.tertiary,
  dark: themeConfig.dark,
  light: themeConfig.light,
  danger: themeConfig.danger,
  text: themeConfig.text,
  chart: themeConfig.chart,
  background: createSlideBackground(themeConfig.background),
  fontFamily: themeConfig.fontFamily
});

// Default theme for backward compatibility
export const THEME = createTheme();

// Enhanced slide masters with better layouts and backgrounds
export const createSlideMasters = (theme: ReturnType<typeof createTheme>) => ({
  TITLE: {
    background: theme.background,
    margin: [0.5, 0.5, 0.5, 0.5],
  },
  CONTENT: {
    background: theme.background,
    margin: [0.5, 0.5, 0.5, 0.5],
  },
  CHART: {
    background: theme.background,
    margin: [0.5, 0.8, 0.5, 0.8],
  }
});

// Default slide masters for backward compatibility
export const slideMasters = createSlideMasters(THEME);

// Helper function to create decorative elements
export const createDecorativeShape = (
  slide: any,
  theme: ReturnType<typeof createTheme>,
  type: 'header-accent' | 'footer-line' | 'corner-element'
) => {
  switch (type) {
    case 'header-accent':
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: '100%',
        h: 0.3,
        fill: { color: theme.primary.replace('#', '') }
      });
      break;
    case 'footer-line':
      slide.addShape('rect', {
        x: 1,
        y: 7,
        w: 8,
        h: 0.1,
        fill: { color: theme.primary.replace('#', '') }
      });
      break;
    case 'corner-element':
      slide.addShape('rect', {
        x: 8.5,
        y: 0,
        w: 1.5,
        h: 1.5,
        fill: { color: theme.primary.replace('#', ''), transparency: 80 }
      });
      break;
  }
};
