
export interface LiveChartData {
  timestamp: number;
}

export interface LivePieChartData extends LiveChartData {
  value: boolean | string;
  count: number;
  percentage: number;
}

export interface LiveBarChartData extends LiveChartData {
  rating: number;
  count: number;
  percentage: number;
}

export interface LiveWordCloudData extends LiveChartData {
  text: string;
  value: number;
  percentage: number;
}
