
export interface ProcessedData {
  summary: {
    totalResponses: number;
    completionRate: number;
    averageRating: number;
  };
  questions: Question[];
  questionData: Record<string, any>;
  comparisons: Record<string, Record<string, any>>;
  responses: Response[];
}

export interface Question {
  id: string;
  name: string;
  type: string;
  title: string;
  rateCount?: number; 
  choices?: string[];
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
