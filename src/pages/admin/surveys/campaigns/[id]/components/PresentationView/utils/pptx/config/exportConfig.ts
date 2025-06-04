
export interface ExportDimension {
  key: string;
  displayName: string;
  enabled: boolean;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  tertiary: string;
  dark: string;
  light: string;
  danger: string;
  fontFamily: string;
  text: {
    primary: string;
    secondary: string;
    light: string;
  };
  chart: {
    colors: string[];
  };
}

export interface ExportConfig {
  dimensions: ExportDimension[];
  includeMainSlides: boolean;
  includeComparisonSlides: boolean;
  includeCompletionSlide: boolean;
  theme: ThemeConfig;
}

export const DEFAULT_DIMENSIONS: ExportDimension[] = [
  { key: "supervisor", displayName: "Supervisor", enabled: true },
  { key: "sbu", displayName: "SBU", enabled: true },
  { key: "gender", displayName: "Gender", enabled: true },
  { key: "location", displayName: "Location", enabled: true },
  { key: "employment_type", displayName: "Employment Type", enabled: true },
  { key: "level", displayName: "Level", enabled: true },
  { key: "employee_type", displayName: "Employee Type", enabled: true },
  { key: "employee_role", displayName: "Employee Role", enabled: true },
  { key: "generation", displayName: "Generation", enabled: true }
];

export const DEFAULT_THEME: ThemeConfig = {
  primary: "#9b87f5",
  secondary: "#7E69AB",
  tertiary: "#6E59A5",
  dark: "#1A1F2C",
  light: "#F1F0FB",
  danger: "#E11D48",
  fontFamily: "Calibri",
  text: {
    primary: "#1A1F2C",
    secondary: "#6E59A5",
    light: "#8E9196"
  },
  chart: {
    colors: [
      "#9b87f5", // Primary Purple
      "#F97316", // Bright Orange
      "#0EA5E9", // Ocean Blue
      "#7E69AB", // Secondary Purple
      "#22C55E", // Green
      "#EAB308", // Yellow
      "#EC4899", // Pink
      "#6366F1", // Indigo
      "#14B8A6", // Teal
      "#8B5CF6"  // Violet
    ]
  }
};

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  dimensions: DEFAULT_DIMENSIONS,
  includeMainSlides: true,
  includeComparisonSlides: true,
  includeCompletionSlide: true,
  theme: DEFAULT_THEME
};
