
export interface ProcessedData {
  summary: {
    totalResponses: number;
    completionRate: number;
    averageRating: number;
  };
  questions: Question[];
  questionData: Record<string, QuestionData>;
  comparisons: Record<string, Record<string, any>>;
  responses: ProcessedResponse[];
}

export interface QuestionData {
  ratings?: Record<string, number>;
  avgRating?: number;
  choices?: Record<string, number>;
  matrix?: Record<string, Record<string, number>>;
}

export interface Question {
  id: string;
  name: string;
  type: string;
  title: string;
  rateCount?: number; 
  choices?: string[];
}

export interface ProcessedResponse {
  id: string;
  respondent: {
    id: string;
    name: string;
    email: string;
    sbu?: { id: string; name: string };
    gender?: string;
    location?: { id: string; name: string };
    employment_type?: { id: string; name: string };
    level?: { id: string; name: string };
    employee_type?: { id: string; name: string };
    employee_role?: { id: string; name: string };
    supervisor?: { id: string; first_name?: string; last_name?: string } | null;
  };
  submitted_at: string;
  answers: Record<string, {
    question: string;
    answer: any;
    questionType: string;
    rateCount?: number;
    question_id?: string;
  }>;
}

export interface Response {
  id: string;
  respondent: {
    id: string;
    sbu?: { name: string };
    gender?: string;
    location?: { name: string };
    employment_type?: { name: string };
    level?: { name: string };
    employee_type?: { name: string };
    employee_role?: { name: string };
  };
  answers: Record<string, {
    answer: any;
    question_id: string;
  }>;
}

// Question-specific response data types
export interface BooleanResponseData {
  yes: number;
  no: number;
}

// Update RatingResponseData to be an array of objects instead of a single object
export type RatingResponseData = Array<{ rating: number; count: number; group?: string }>;

export interface SatisfactionData {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  median: number;
}

// Comparison types
export interface ComparisonGroup {
  dimension: string;
  [key: string]: number | string;
}
