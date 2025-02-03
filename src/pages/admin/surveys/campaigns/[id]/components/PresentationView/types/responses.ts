export interface BooleanResponseData {
  yes: number;
  no: number;
}

export interface RatingResponseData {
  rating: number;
  count: number;
}[]

export interface SatisfactionData {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  median: number;
}

export interface TextResponseData {
  text: string;
  value: number;
}[]

export interface Question {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
}

export interface ProcessedResponse {
  id: string;
  respondent: {
    name: string;
    email: string;
    gender: string | null;
    location: {
      id: string;
      name: string;
    } | null;
    sbu: {
      id: string;
      name: string;
    } | null;
    employment_type: {
      id: string;
      name: string;
    } | null;
  };
  submitted_at: string;
  answers: Record<string, {
    question: string;
    answer: any;
    questionType: string;
  }>;
}

export interface ProcessedData {
  questions: Question[];
  responses: ProcessedResponse[];
}