
export interface InstanceMetrics {
  avg_rating: number | null;
  unique_respondents: number | null;
  total_responses: number | null;
  ends_at: string | null;
  starts_at: string | null;
  period_number: number | null;
  campaign_instance_id: string | null;
  gender_breakdown: Record<string, any> | null;
  location_breakdown: Record<string, any> | null;
  completion_rate: number | null;
}

export interface QuestionComparison {
  period_number: number | null;
  campaign_instance_id: string | null;
  response_count: number | null;
  avg_numeric_value: number | null;
  yes_percentage: number | null;
  question_key: string | null;
  text_responses: string[] | null;
}

export interface ComparisonData {
  baseInstance: InstanceMetrics;
  comparisonInstance: InstanceMetrics;
}

export interface QuestionComparisonData {
  baseInstance: QuestionComparison[];
  comparisonInstance: QuestionComparison[];
}
