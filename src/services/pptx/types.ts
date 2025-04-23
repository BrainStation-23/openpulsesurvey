
export interface SurveyQuestion {
  name: string;
  title: string;
  type: string;
  rateMax?: number;
  rateCount?: number;
}

export interface CampaignMetadata {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  completion_rate: number;
  survey: {
    id: string;
    name: string;
  };
  instance?: {
    id: string;
    period_number: number;
    starts_at: string;
    ends_at: string;
    status: string;
    completion_rate: number;
  };
}

export interface Respondent {
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
}

export interface QuestionResponse {
  question: string;
  answer: any;
  questionType: string;
  rateCount?: number;
}

export interface ProcessedResponse {
  id: string;
  respondent: Respondent;
  submitted_at: string;
  answers: Record<string, QuestionResponse>;
}

export interface PresentationData {
  campaign: CampaignMetadata;
  questions: SurveyQuestion[];
  responses: ProcessedResponse[];
}

export type ProgressCallback = (progress: number) => void;

export interface PptxExportOptions {
  campaignId: string;
  instanceId?: string;
  onProgress?: ProgressCallback;
}

export type ComparisonDimension = 'main' | 'sbu' | 'gender' | 'location' | 'employment_type' | 'level' | 'employee_type' | 'employee_role' | 'supervisor' | 'none';
