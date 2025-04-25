
export interface Respondent {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  sbu?: { id: string; name: string };
  location?: { id: string; name: string };
  employment_type?: { id: string; name: string };
  level?: { id: string; name: string };
  employee_type?: { id: string; name: string };
  employee_role?: { id: string; name: string };
  supervisor?: { id: string; name: string };
}

export interface Answer {
  answer: boolean | number | string;
}

export interface SurveyResponse {
  id: string;
  submitted_at: string;
  answers: Record<string, Answer>;
  respondent: Respondent;
}

export interface QuestionMeta {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
}

export interface ProcessedData {
  questions: QuestionMeta[];
  responses: SurveyResponse[];
}

export type RatingResponseData = NpsData | SatisfactionData;

export interface BooleanResponseData {
  yes: number;
  no: number;
}

export interface SatisfactionData {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  median?: number;
  avg_score?: number;
}
