
export interface PPTXExportConfig {
  // Content selection
  slides: {
    includeTitleSlide: boolean;
    includeCompletionSlide: boolean;
    includeTrendSlide: boolean;
    includeQuestionSlides: boolean;
  };
  questions: {
    includedQuestionIds: string[] | "all";
    excludeTextQuestions: boolean;
  };
  comparisons: {
    dimensions: ComparisonDimension[];
  };
  // Appearance
  theme: PPTXTheme;
  branding: {
    includeLogo: boolean;
    logoUrl?: string;
    includeFooter: boolean;
    footerText?: string;
  };
}

export type ComparisonDimension = 
  | "sbu" 
  | "gender" 
  | "location" 
  | "employment_type" 
  | "level" 
  | "employee_type" 
  | "employee_role";

export type PPTXTheme = 
  | "default" 
  | "corporate" 
  | "modern" 
  | "minimal" 
  | "vibrant";

export const DEFAULT_EXPORT_CONFIG: PPTXExportConfig = {
  slides: {
    includeTitleSlide: true,
    includeCompletionSlide: true,
    includeTrendSlide: true,
    includeQuestionSlides: true,
  },
  questions: {
    includedQuestionIds: "all",
    excludeTextQuestions: true,
  },
  comparisons: {
    dimensions: ["sbu", "gender", "location", "employment_type", "level", "employee_type", "employee_role"],
  },
  theme: "default",
  branding: {
    includeLogo: false,
    includeFooter: false,
  }
};

export const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  "sbu",
  "gender",
  "location",
  "employment_type",
  "level",
  "employee_type",
  "employee_role"
];

export const THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "corporate", label: "Corporate" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "vibrant", label: "Vibrant" }
];
