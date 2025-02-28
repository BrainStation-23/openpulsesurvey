
export interface DemographicStats {
  total: number;
  completed: number;
}

export interface QuestionStats {
  type: string;
  question: string;
  average?: number;
  true_count?: number;
  false_count?: number;
  responses?: string[];
}

export interface AnalysisData {
  campaign: {
    id: string;
    survey: {
      id: string;
      name: string;
      description: string;
      json_data: any;
    };
  };
  instance: {
    id: string;
    completion_rate: number;
  };
  overview: {
    completion_rate: number;
    total_responses: number;
    response_trends: Array<{
      date: string;
      count: number;
    }>;
  };
  demographics: {
    by_department: Record<string, DemographicStats>;
    by_gender: Record<string, DemographicStats>;
    by_location: Record<string, DemographicStats>;
    by_employment_type: Record<string, DemographicStats>;
  };
  questions: Record<string, QuestionStats>;
}
