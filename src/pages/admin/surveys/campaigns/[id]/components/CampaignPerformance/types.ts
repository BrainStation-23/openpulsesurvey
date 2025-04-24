export interface CampaignInstance {
  id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'completed' | 'upcoming';
  completion_rate?: number;
}

export interface TrendDataPoint {
  date: string;
  responseCount: number;
  uniqueRespondents: number;
  instance?: string;
  periodNumber?: number;
}

export interface CompletionRateDataPoint {
  instance: string;
  periodNumber: number;
  completionRate: number;
  totalAssignments: number;
  completedResponses: number;
}

export interface ResponseVolumeDataPoint {
  instance: string;
  periodNumber: number;
  responseCount: number;
  averageTimeToComplete?: number;
}

export interface TrendMetric {
  label: string;
  value: string | number;
  change?: number;
  changeDirection?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export interface DemographicBreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

export interface PeriodAnalysisDataPoint {
  periodNumber: number;
  avgRating: number;
  completionRate: number;
  responseCount: number;
}
