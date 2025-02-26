
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

export interface LiveSessionQuestion {
  id: string;
  session_id: string;
  question_key: string;
  question_data: {
    type: string;
    choices?: { text: string; value: string; }[];
    [key: string]: any;
  };
  title: string;
  status: string;
  display_order: number;
}
