
import { ReactNode } from 'react';

export interface MetricSummary {
  title: string;
  value: number | string;
  change?: number | string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  icon?: ReactNode;
}

export interface SBUPerformanceData {
  sbu: string;
  baseScore: number;
  comparisonScore: number;
  change: number;
  baseRank: number;
  comparisonRank: number;
  rankChange: number;
  category: 'improved' | 'declined' | 'unchanged';
}

export interface SupervisorPerformer {
  name: string;
  base_score: number;
  comparison_score: number;
  change: number;
  base_rank: number;
  comparison_rank: number;
  rank_change: number;
  department?: string;
  total_reports?: number;
}

export interface TopSBUPerformer {
  name: string;
  sbu: string;
  baseScore: number;
  comparisonScore: number;
  change: number;
  baseRank: number;
  comparisonRank: number;
  rankChange: number;
}
