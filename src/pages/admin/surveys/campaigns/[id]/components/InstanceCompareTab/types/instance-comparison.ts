
export type TopSBUPerformer = {
  sbu: string;
  name: string;
  baseScore: number;
  comparisonScore: number;
  change: number;
  baseRank: number;
  comparisonRank: number;
  rankChange: number;
  category?: 'improved' | 'declined' | 'stable';
};

export type SupervisorPerformer = {
  name: string;
  base_score: number;
  comparison_score: number;
  change: number;
  base_rank: number;
  comparison_rank: number;
  rank_change: number;
  department?: string;
  total_reports?: number;
  category?: 'improved' | 'declined' | 'stable';
};

export type MetricSummary = {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  description?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
};

export type ChartViewType = 'distribution' | 'movement' | 'matrix' | 'timeline';

// Add the SBUPerformanceData type
export type SBUPerformanceData = {
  sbu: string;
  baseScore: number;
  comparisonScore: number;
  change: number;
  baseRank: number;
  comparisonRank: number;
  rankChange: number;
  category: 'improved' | 'declined' | 'unchanged';
};

// Add missing ComparisonData type
export type ComparisonData = {
  baseInstance: {
    avg_rating: number;
    unique_respondents: number;
    total_responses: number;
    ends_at: string;
    starts_at: string;
    period_number: number;
    campaign_instance_id: string;
    gender_breakdown: any | null;
    location_breakdown: any | null;
    completion_rate: number;
  };
  comparisonInstance: {
    avg_rating: number;
    unique_respondents: number;
    total_responses: number;
    ends_at: string;
    starts_at: string;
    period_number: number;
    campaign_instance_id: string;
    gender_breakdown: any | null;
    location_breakdown: any | null;
    completion_rate: number;
  };
};

// Add missing QuestionComparisonData type
export type QuestionComparisonData = {
  baseInstance: any[];
  comparisonInstance: any[];
};
