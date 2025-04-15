
export interface BooleanResponseData {
  yes: number;
  no: number;
}

export interface RatingDataPoint {
  rating: number;
  count: number;
  group?: string;
}

export type RatingResponseData = RatingDataPoint[];

export interface SatisfactionData {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  median: number;
}

export interface TextDataPoint {
  text: string;
  value: number;
}

export type TextResponseData = TextDataPoint[];

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
    level: {
      id: string;
      name: string;
    } | null;
    employee_type: {
      id: string;
      name: string;
    } | null;
    employee_role: {
      id: string;
      name: string;
    } | null;
    supervisor: {
      id: string;
      first_name: string;
      last_name: string;
    } | null;
  };
  submitted_at: string;
  answers: Record<string, {
    question: string;
    answer: any;
    questionType: string;
    rateCount?: number;
  }>;
}

export interface ProcessedData {
  questions: Question[];
  responses: ProcessedResponse[];
  campaignId: string;
  instanceId: string;
}

