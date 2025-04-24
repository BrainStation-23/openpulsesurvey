
export interface NpsData {
  detractors: number;
  passives: number;
  promoters: number;
  total: number;
  nps_score: number;
}

export interface NpsComparisonData extends NpsData {
  dimension: string;
}
