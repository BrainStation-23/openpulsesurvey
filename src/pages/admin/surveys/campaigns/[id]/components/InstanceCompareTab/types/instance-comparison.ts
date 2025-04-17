
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
