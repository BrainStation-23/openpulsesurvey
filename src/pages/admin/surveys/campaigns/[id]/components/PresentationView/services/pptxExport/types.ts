
import { CampaignData } from "../../types";

// Configuration options for PPTX export
export interface PptxExportConfig {
  // Slides to include
  includeTitleSlide: boolean;
  includeCompletionSlide: boolean;
  includeTrendsSlide: boolean;
  includeQuestionSlides: boolean;
  
  // Comparison dimensions to include (empty array means no comparison slides)
  dimensions: string[];
  
  // Theme settings
  theme: {
    primary: string;
    secondary: string;
    tertiary: string;
    dark: string;
    light: string;
    danger: string;
  };
  
  // Export metadata
  fileName?: string;
  author?: string;
  company?: string;
  
  // Content filtering
  excludeQuestionTypes?: string[]; // e.g. ["text", "comment"]
  onlyIncludeQuestions?: string[]; // specific question names to include
  
  // Progress callback
  onProgress?: (progress: number) => void;
}

// Default export configuration
export const DEFAULT_EXPORT_CONFIG: PptxExportConfig = {
  includeTitleSlide: true,
  includeCompletionSlide: true,
  includeTrendsSlide: true,
  includeQuestionSlides: true,
  dimensions: ['sbu', 'gender', 'location', 'employment_type', 'level', 'employee_type', 'employee_role'],
  theme: {
    primary: "#9b87f5",
    secondary: "#7E69AB",
    tertiary: "#6E59A5",
    dark: "#1A1F2C",
    light: "#F1F0FB",
    danger: "#E11D48"
  },
  excludeQuestionTypes: ["text", "comment"],
  onlyIncludeQuestions: [],
};

// Question data structure
export interface QuestionData {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
}

// Response data structure from RPC functions
export interface DimensionDataResponse {
  dimension: string;
  [key: string]: any; // Additional properties based on question type
}

// Question response data
export interface QuestionResponseData {
  questionData: QuestionData;
  mainData: any;
  dimensionData: Record<string, DimensionDataResponse[]>;
}

