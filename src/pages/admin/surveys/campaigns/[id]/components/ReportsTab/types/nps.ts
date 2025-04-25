
export interface NpsData {
  detractors: number;
  passives: number;
  promoters: number;
  total: number;
  nps_score: number;
  avg_score?: number;
}

export interface NpsComparisonData {
  dimension: string;
  detractors: number;
  passives: number;
  promoters: number;
  total: number;
  nps_score: number;
  avg_score?: number;
}
