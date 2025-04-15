
import { COMPARISON_DIMENSIONS } from "../constants";

export type ComparisonDimension = typeof COMPARISON_DIMENSIONS[number];

export interface PPTXExportConfig {
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
  branding: {
    theme: string;
    includeLogo: boolean;
    logoUrl?: string;
    includeFooter: boolean;
    footerText?: string;
  };
}

export const DEFAULT_EXPORT_CONFIG: PPTXExportConfig = {
  slides: {
    includeTitleSlide: true,
    includeCompletionSlide: true,
    includeTrendSlide: false,
    includeQuestionSlides: true,
  },
  questions: {
    includedQuestionIds: "all",
    excludeTextQuestions: true,
  },
  comparisons: {
    dimensions: ["sbu", "gender", "location"],
  },
  branding: {
    theme: "default",
    includeLogo: false,
    logoUrl: "",
    includeFooter: false,
    footerText: "",
  },
};
