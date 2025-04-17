
// Define processed data types
export interface Question {
  name: string;
  title: string;
  type: string;
  rateCount: number;
}

export interface Respondent {
  name: string;
  email?: string;
  gender?: string;
  location?: { id: string; name: string } | null;
  sbu?: { id: string; name: string } | null;
  employment_type?: { id: string; name: string } | null;
  level?: { id: string; name: string } | null;
  employee_type?: { id: string; name: string } | null;
  employee_role?: { id: string; name: string } | null;
  supervisor?: { id: string; first_name: string; last_name: string } | null;
}

export interface ProcessedResponse {
  id: string;
  respondent: Respondent;
  submitted_at: string;
  answers: Record<string, any>;
}

export interface ProcessedData {
  questions: Question[];
  responses: ProcessedResponse[];
}

// Response data types
export interface BooleanResponseData {
  yes: number;
  no: number;
}

export interface RatingItem {
  rating: number;
  count: number;
}

export type RatingResponseData = RatingItem[];

export interface SatisfactionData {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  median: number;
}

// Union type for all processed result types
export type ProcessedResult = 
  | BooleanResponseData 
  | RatingResponseData 
  | SatisfactionData 
  | any[];
