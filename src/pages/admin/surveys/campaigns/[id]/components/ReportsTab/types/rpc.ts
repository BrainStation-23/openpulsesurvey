
export interface SurveyResponsesResult {
  campaign: {
    survey: {
      id: string;
      name: string;
      json_data: any;
    }
  };
  responses: Array<{
    id: string;
    response_data: Record<string, any>;
    submitted_at: string;
    user_data: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      gender: string | null;
      location: { id: string; name: string } | null;
      employment_type: { id: string; name: string } | null;
      level: { id: string; name: string } | null;
      employee_type: { id: string; name: string } | null;
      employee_role: { id: string; name: string } | null;
      user_sbus: Array<{
        is_primary: boolean;
        sbu: { id: string; name: string };
      }> | null;
    };
  }>;
}

export interface ComparisonDataItem {
  dimension: string;
  yes_count: number;
  no_count: number;
  avg_rating: number;
  detractors: number;
  passives: number;
  promoters: number;
  text_response_count: number;
  total: number;
  text_samples: string[];
}

export interface TextAnalysisItem {
  text: string;
  value: number;
}
