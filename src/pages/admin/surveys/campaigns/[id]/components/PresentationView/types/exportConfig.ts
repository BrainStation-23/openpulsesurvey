
import { ComparisonDimension } from "./comparison";

export interface PPTXExportConfig {
  slides: {
    includeTitleSlide: boolean;
    includeCompletionSlide: boolean;
    includeTrendSlide: boolean;
    includeQuestionSlides: boolean;
  };
  questions: {
    excludeTextQuestions: boolean;
    includedQuestionIds: string[] | "all";
  };
  comparisons: {
    dimensions: ComparisonDimension[];
  };
  branding: {
    theme: "default" | "modern" | "classic";
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
    excludeTextQuestions: true,
    includedQuestionIds: "all",
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
