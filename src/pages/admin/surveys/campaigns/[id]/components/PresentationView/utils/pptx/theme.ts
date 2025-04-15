
// Theme definitions for PPT exports
export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  dark: string;
  light: string;
  danger: string; // Added danger color
  text: {
    primary: string;
    secondary: string;
    light: string;
  };
  chart: {
    colors: string[];
  };
}

// Define multiple theme options
const THEMES: Record<string, ThemeColors> = {
  default: {
    primary: "#9b87f5",
    secondary: "#7E69AB",
    tertiary: "#6E59A5",
    dark: "#1A1F2C",
    light: "#E5DEFF",
    danger: "#ea384c",
    text: {
      primary: "#222222",
      secondary: "#555555",
      light: "#888888",
    },
    chart: {
      colors: ["#9b87f5", "#7E69AB", "#6E59A5", "#1A1F2C", "#E5DEFF", "#D6BCFA"]
    }
  },
  corporate: {
    primary: "#0EA5E9",
    secondary: "#33C3F0",
    tertiary: "#1EAEDB",
    dark: "#333333",
    light: "#D3E4FD",
    danger: "#F97316",
    text: {
      primary: "#222222",
      secondary: "#555555",
      light: "#888888",
    },
    chart: {
      colors: ["#0EA5E9", "#33C3F0", "#1EAEDB", "#D3E4FD", "#0c8bbc", "#054766"]
    }
  },
  modern: {
    primary: "#8B5CF6",
    secondary: "#D946EF",
    tertiary: "#D6BCFA",
    dark: "#1A1F2C",
    light: "#F1F0FB",
    danger: "#F97316",
    text: {
      primary: "#1A1F2C",
      secondary: "#403E43",
      light: "#8A898C",
    },
    chart: {
      colors: ["#8B5CF6", "#D946EF", "#D6BCFA", "#E5DEFF", "#7c4ced", "#6839d3"]
    }
  },
  minimal: {
    primary: "#403E43",
    secondary: "#8A898C",
    tertiary: "#9F9EA1",
    dark: "#221F26",
    light: "#F6F6F7",
    danger: "#ea384c",
    text: {
      primary: "#403E43",
      secondary: "#8A898C",
      light: "#C8C8C9",
    },
    chart: {
      colors: ["#403E43", "#8A898C", "#9F9EA1", "#F6F6F7", "#C8C8C9", "#706D74"]
    }
  },
  vibrant: {
    primary: "#F97316",
    secondary: "#D946EF",
    tertiary: "#0EA5E9",
    dark: "#1A1F2C",
    light: "#FFDEE2",
    danger: "#ea384c",
    text: {
      primary: "#1A1F2C",
      secondary: "#403E43",
      light: "#8A898C",
    },
    chart: {
      colors: ["#F97316", "#D946EF", "#0EA5E9", "#8B5CF6", "#FDE1D3", "#FEC6A1"]
    }
  }
};

// Export the default theme
export const THEME = THEMES.default;

// Export a function to get a theme by name
export const getTheme = (themeName: string): ThemeColors => {
  return THEMES[themeName] || THEMES.default;
};

// Slide masters for various slide types
export const slideMasters = {
  TITLE: {
    background: { color: THEME.light },
    slideNumber: { x: 0.5, y: "90%", color: THEME.text.secondary, fontFace: "Arial" },
  },
  SECTION: {
    background: { color: THEME.primary },
    slideNumber: { x: 0.5, y: "90%", color: "#FFFFFF", fontFace: "Arial" },
  },
  CHART: {
    background: { color: "#FFFFFF" },
    slideNumber: { x: 0.5, y: "90%", color: THEME.text.secondary, fontFace: "Arial" },
  }
};

// Function to get slide masters for a specific theme
export const getSlideMasters = (themeName: string) => {
  const theme = getTheme(themeName);
  
  return {
    TITLE: {
      background: { color: theme.light },
      slideNumber: { x: 0.5, y: "90%", color: theme.text.secondary, fontFace: "Arial" },
    },
    SECTION: {
      background: { color: theme.primary },
      slideNumber: { x: 0.5, y: "90%", color: "#FFFFFF", fontFace: "Arial" },
    },
    CHART: {
      background: { color: "#FFFFFF" },
      slideNumber: { x: 0.5, y: "90%", color: theme.text.secondary, fontFace: "Arial" },
    }
  };
};
